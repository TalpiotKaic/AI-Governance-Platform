import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_req: Request, ctx: RouteContext<"/api/files/[id]">) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  const ev = await db.evidence.findFirst({ where: { id, orgId: session.orgId } });
  if (!ev || !ev.fileName) return new Response("Not found", { status: 404 });
  const dir = path.join(process.cwd(), "uploads", session.orgId);
  const files = await readdir(dir).catch(() => [] as string[]);
  const match = files.find((f) => f.startsWith(`${id}__`));
  if (!match) return new Response("File missing", { status: 404 });
  const buf = await readFile(path.join(dir, match));
  return new Response(new Uint8Array(buf), { headers: { "content-type": ev.mimeType ?? "application/octet-stream", "content-disposition": `inline; filename="${encodeURIComponent(ev.fileName)}"` } });
}
