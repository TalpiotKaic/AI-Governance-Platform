import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

/** Download the file attached to a governance document (served outside /api so it works behind API proxies). */
export async function GET(_req: Request, ctx: RouteContext<"/policies/[id]/file">) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  const doc = await db.policy.findFirst({ where: { id, orgId: session.orgId } });
  if (!doc || !doc.fileName) return new Response("Not found", { status: 404 });
  const dir = path.join(process.cwd(), "uploads", session.orgId);
  const files = await readdir(dir).catch(() => [] as string[]);
  const match = files.find((f) => f.startsWith(`doc_${id}__`));
  if (!match) return new Response("File missing", { status: 404 });
  const buf = await readFile(path.join(dir, match));
  return new Response(new Uint8Array(buf), { headers: { "content-type": doc.mimeType ?? "application/octet-stream", "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(doc.fileName)}` } });
}
