import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { validEvidenceWhere } from "@/lib/documents";

export async function GET(_req: Request, ctx: RouteContext<"/api/reports/[id]/export">) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  const r = await db.report.findFirst({ where: { id, orgId: session.orgId }, include: { system: true, runs: { include: { run: { include: { metrics: true, findings: true } } } } } });
  if (!r) return new Response("Not found", { status: 404 });
  const evidence = await db.evidence.findMany({ where: validEvidenceWhere(session.orgId, r.systemId), include: { links: { include: { control: true, requirement: { include: { framework: true } } } } } });
  const payload = { report: { id: r.id, code: r.code, type: r.type, title: r.title, version: r.version, status: r.status, issuedAt: r.issuedAt, content: r.content }, system: { code: r.system.code, name: r.system.name, type: r.system.type }, runs: r.runs.map((x) => ({ code: x.run.code, mode: x.run.mode, verdict: x.run.verdict, summary: x.run.summary, metrics: x.run.metrics, findings: x.run.findings })), evidenceIndex: evidence.map((e) => ({ id: e.id, type: e.type, title: e.title, source: e.source, sha256: e.sha256, links: e.links.map((l) => l.control?.code ?? (l.requirement ? `${l.requirement.framework.code} ${l.requirement.ref}` : null)) })), exportedAt: new Date().toISOString() };
  return new Response(JSON.stringify(payload, null, 2), { headers: { "content-type": "application/json", "content-disposition": `attachment; filename="${r.code}-v${r.version}.json"` } });
}
