import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const maxDuration = 60;

// Find a Chromium binary: CHROMIUM_PATH, then PLAYWRIGHT_BROWSERS_PATH/chromium-<rev>/chrome-linux/chrome, then common system paths.
async function resolveChromium(): Promise<string | undefined> {
  const { readdir, access } = await import("node:fs/promises");
  const path = await import("node:path");
  const exists = async (p: string) => access(p).then(() => true).catch(() => false);
  if (process.env.CHROMIUM_PATH && (await exists(process.env.CHROMIUM_PATH))) return process.env.CHROMIUM_PATH;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (root) {
    const dirs = await readdir(root).catch(() => [] as string[]);
    for (const d of dirs.filter((x) => x.startsWith("chromium")).sort().reverse()) {
      for (const rel of ["chrome-linux/chrome", "chrome-linux/headless_shell", "chrome-mac/Chromium.app/Contents/MacOS/Chromium", "chrome-win/chrome.exe"]) {
        const p = path.join(root, d, rel);
        if (await exists(p)) return p;
      }
    }
  }
  for (const p of [
    "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
  ]) if (await exists(p)) return p;
  return undefined;
}

export async function GET(req: Request, ctx: RouteContext<"/api/reports/[id]/pdf">) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  const r = await db.report.findFirst({ where: { id, orgId: session.orgId } });
  if (!r) return new Response("Not found", { status: 404 });
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const protocol = req.headers.get("x-forwarded-proto") ?? (req.url.startsWith("https") ? "https" : "http");
  const origin = `${protocol}://${host}`;
  const printUrl = `${origin}/print/reports/${id}?token=${encodeURIComponent(process.env.AUTH_SECRET ?? "")}`;
  try {
    const { chromium } = await import("playwright-core");
    const executablePath = await resolveChromium();
    const browser = await chromium.launch({ headless: true, executablePath, args: ["--no-sandbox"] }).catch(() => chromium.launch({ headless: true, args: ["--no-sandbox"] }));
    try {
      const page = await browser.newPage();
      await page.goto(printUrl, { waitUntil: "networkidle", timeout: 30000 });
      const pdf = await page.pdf({ format: "A4", printBackground: true, margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" }, displayHeaderFooter: true, headerTemplate: `<div style="font-size:8px;width:100%;padding:0 14mm;color:#666;">K-VeriAI · ${r.code} v${r.version}</div>`, footerTemplate: `<div style="font-size:8px;width:100%;padding:0 14mm;color:#666;display:flex;justify-content:space-between;"><span>${r.title.replace(/</g, "&lt;")}</span><span class="pageNumber"></span>/<span class="totalPages"></span></div>` });
      return new Response(new Uint8Array(pdf), { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="${r.code}-v${r.version}.pdf"` } });
    } finally { await browser.close(); }
  } catch (err) {
    // Fallback: redirect to the print view so the browser's own "Save as PDF" can be used.
    console.warn("PDF render unavailable, falling back to print view:", (err as Error).message);
    return Response.redirect(`${origin}/print/reports/${id}`, 302);
  }
}
