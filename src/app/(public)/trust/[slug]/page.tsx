import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/progress";
import { fmtDate} from "@/lib/utils";
import { getI18n } from "@/lib/i18n/server";

export default async function TrustCenterPage(props: PageProps<"/trust/[slug]">) {
  const { t, L } = await getI18n();
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
      <header className="border-b border-border bg-surface"><div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-5"><Image src="/kveriai_logo.jpg" alt="K-VeriAI Logo" width={40} height={40} className="h-10 w-10 rounded-lg object-cover" /><div><h1 className="text-xl font-semibold">{org.name} — AI Trust Center</h1><p className="text-xs text-muted">Published by K-VeriAI · last updated {fmtDate(new Date())}</p></div></div></header>
      <main className="mx-auto max-w-5xl space-y-8 px-6 py-8">
        <section><p className="text-sm leading-relaxed">{org.trustCenterIntro}</p></section>
        <section><h2 className="mb-3 text-base font-semibold">{t("Governance commitments")}</h2><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{frameworks.filter((f) => f.code !== "NIST_ARIA").map((f) => <div key={f.id} className="rounded-lg border border-border bg-surface p-3 text-sm"><div className="font-medium">{L(f.code)}</div><div className="text-xs text-muted">{f.version}</div></div>)}</div><p className="mt-2 text-xs text-muted">{verified} harmonized control implementations verified or implemented across {systems.length} in-scope systems.</p></section>
        <section><h2 className="mb-3 text-base font-semibold">{t("AI systems in scope")}</h2><div className="grid grid-cols-1 gap-3 md:grid-cols-2">{systems.map((s) => <div key={s.id} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4"><ScoreRing value={s.assuranceScore} size={64} label={t("Assurance")} /><div className="text-sm"><div className="font-medium">{s.name}</div><div className="text-xs text-muted">{L(s.type)} · {s.sector} · {L(s.lifecycleStage)}</div><div className="mt-1 flex flex-wrap gap-1"><Badge>{L(s.euAiActCategory)}</Badge>{s.customerFacing && <Badge tone="accent">{t("AI disclosure")}</Badge>}{s.humanOversight && <Badge tone="info">{t("Human oversight")}</Badge>}</div></div></div>)}</div></section>
        <section><h2 className="mb-3 text-base font-semibold">{t("Active policies")}</h2><ul className="space-y-1 text-sm">{policies.map((p) => <li key={p.id} className="rounded-md border border-border bg-surface px-3 py-2">{p.title} <span className="text-xs text-muted">v{p.version}{p.effectiveDate ? ` · effective ${fmtDate(p.effectiveDate)}` : ""}</span></li>)}</ul></section>
        <section><h2 className="mb-3 text-base font-semibold">{t("Issued assurance reports")}</h2>{issued.length ? <ul className="space-y-1 text-sm">{issued.map((r) => <li key={r.id} className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2"><span>{L(r.type)} — {r.system.name} <span className="text-xs text-muted">v{r.version}</span></span><span className="text-xs text-muted">{fmtDate(r.issuedAt)}</span></li>)}</ul> : <p className="text-sm text-muted">{t("No issued reports yet.")}</p>}<p className="mt-2 text-xs text-muted">{t("Report contents are available to customers and auditors on request.")}</p></section>
      </main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted">{t("K-VeriAI AI Governance, Evaluation & Assurance Platform")}</footer>
    </div>
  );
}
