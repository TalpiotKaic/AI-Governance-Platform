import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/progress";
import { enumLabel, fmtDate } from "@/lib/utils";

export default async function TrustCenterPage(props: PageProps<"/trust/[slug]">) {
  const { slug } = await props.params;
  const org = await db.organization.findUnique({ where: { slug } });
  if (!org || !org.trustCenterEnabled) notFound();
  const systems = await db.aiSystem.findMany({ where: { orgId: org.id, lifecycleStage: { in: ["APPROVED", "PRODUCTION", "TESTING"] } }, orderBy: { code: "asc" } });
  const policies = await db.policy.findMany({ where: { orgId: org.id, status: "ACTIVE" } });
  const issued = await db.report.findMany({ where: { orgId: org.id, status: "ISSUED" }, orderBy: { issuedAt: "desc" }, take: 10, include: { system: true } });
  const frameworks = await db.framework.findMany();
  const impls = await db.controlImplementation.findMany({ where: { system: { orgId: org.id } } });
  const verified = impls.filter((i) => i.status === "VERIFIED" || i.status === "IMPLEMENTED").length;
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface"><div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-5"><img src="/kveriai_logo.jpg" alt="K-VeriAI Logo" className="h-10 w-10 rounded-lg object-cover" /><div><h1 className="text-xl font-semibold">{org.name} — AI Trust Center</h1><p className="text-xs text-muted">Published by K-VeriAI · last updated {fmtDate(new Date())}</p></div></div></header>
      <main className="mx-auto max-w-5xl space-y-8 px-6 py-8">
        <section><p className="text-sm leading-relaxed">{org.trustCenterIntro}</p></section>
        <section><h2 className="mb-3 text-base font-semibold">Governance commitments</h2><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{frameworks.filter((f) => f.code !== "NIST_ARIA").map((f) => <div key={f.id} className="rounded-lg border border-border bg-surface p-3 text-sm"><div className="font-medium">{enumLabel(f.code)}</div><div className="text-xs text-muted">{f.version}</div></div>)}</div><p className="mt-2 text-xs text-muted">{verified} harmonized control implementations verified or implemented across {systems.length} in-scope systems.</p></section>
        <section><h2 className="mb-3 text-base font-semibold">AI systems in scope</h2><div className="grid grid-cols-1 gap-3 md:grid-cols-2">{systems.map((s) => <div key={s.id} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4"><ScoreRing value={s.assuranceScore} size={64} label="Assurance" /><div className="text-sm"><div className="font-medium">{s.name}</div><div className="text-xs text-muted">{enumLabel(s.type)} · {s.sector} · {enumLabel(s.lifecycleStage)}</div><div className="mt-1 flex flex-wrap gap-1"><Badge>{enumLabel(s.euAiActCategory)}</Badge>{s.customerFacing && <Badge tone="accent">AI disclosure</Badge>}{s.humanOversight && <Badge tone="info">Human oversight</Badge>}</div></div></div>)}</div></section>
        <section><h2 className="mb-3 text-base font-semibold">Active policies</h2><ul className="space-y-1 text-sm">{policies.map((p) => <li key={p.id} className="rounded-md border border-border bg-surface px-3 py-2">{p.title} <span className="text-xs text-muted">v{p.version}{p.effectiveDate ? ` · effective ${fmtDate(p.effectiveDate)}` : ""}</span></li>)}</ul></section>
        <section><h2 className="mb-3 text-base font-semibold">Issued assurance reports</h2>{issued.length ? <ul className="space-y-1 text-sm">{issued.map((r) => <li key={r.id} className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2"><span>{enumLabel(r.type)} — {r.system.name} <span className="text-xs text-muted">v{r.version}</span></span><span className="text-xs text-muted">{fmtDate(r.issuedAt)}</span></li>)}</ul> : <p className="text-sm text-muted">No issued reports yet.</p>}<p className="mt-2 text-xs text-muted">Report contents are available to customers and auditors on request.</p></section>
      </main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted">K-VeriAI AI Governance, Evaluation & Assurance Platform</footer>
    </div>
  );
}
