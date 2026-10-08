import Link from "next/link";
import { FileSpreadsheet, Plus } from "lucide-react";
import { requireUser, userCan } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge, toneForStatus, toneForTier } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR, EmptyState } from "@/components/ui/table";
import { fmtAgo} from "@/lib/utils";
import { getI18n } from "@/lib/i18n/server";

export const metadata = { title: "AI Inventory" };

export default async function SystemsPage(props: PageProps<"/systems">) {
  const sp = await props.searchParams;
  const imported = typeof sp.imported === "string" ? Number(sp.imported) : 0;
  const { t, L } = await getI18n();
  const user = await requireUser();
  const systems = await db.aiSystem.findMany({ where: { orgId: user.orgId }, orderBy: { code: "asc" }, include: { owner: true, models: true, _count: { select: { risks: true, runs: true, evidence: true } } } });
  return (
    <>
      <PageHeader title={t("AI Inventory")} description={t("Every AI system, model and agent in scope — the top-level object that risks, controls, tests, evidence and reports attach to.")} actions={userCan(user, "systems.write") && <div className="flex items-center gap-2"><Link href="/systems/import"><Button variant="outline"><FileSpreadsheet className="h-4 w-4" /> {t("Import from Excel")}</Button></Link><Link href="/systems/new"><Button><Plus className="h-4 w-4" /> {t("Register AI system")}</Button></Link></div>} />
      {imported > 0 && <p className="mb-4 rounded-md border border-success/40 bg-success-soft px-3 py-2 text-sm text-success">{imported} {t("systems were registered from Excel. Each one has its intake tier, seeded risks and approval workflow.")}</p>}
      {systems.length === 0 ? <EmptyState title={t("No AI systems registered")} description={t("Register your first AI system to start the intake → risk → control → test → evidence chain.")} action={userCan(user, "systems.write") ? <Link href="/systems/new"><Button>{t("Register AI system")}</Button></Link> : undefined} /> : (
        <div className="rounded-lg border border-border bg-surface">
          <Table>
            <THead><TR><TH>{t("Code")}</TH><TH>{t("System")}</TH><TH>{t("Type")}</TH><TH>{t("Stage")}</TH><TH>{t("EU AI Act")}</TH><TH>{t("Tier")}</TH><TH>{t("Assurance")}</TH><TH>{t("Risks")}</TH><TH>{t("Runs")}</TH><TH>{t("Evidence")}</TH><TH>{t("Owner")}</TH><TH>{t("Updated")}</TH></TR></THead>
            <TBody>
              {systems.map((s) => (
                <TR key={s.id}>
                  <TD className="font-mono text-xs text-muted">{s.code}</TD>
                  <TD><Link href={`/systems/${s.id}`} className="font-medium hover:underline">{s.name}</Link><div className="text-xs text-muted">{s.models.map((m) => `${m.provider} ${m.name}`).join(", ") || s.sector}</div></TD>
                  <TD><Badge>{L(s.type)}</Badge></TD>
                  <TD><Badge tone={toneForStatus(s.lifecycleStage)}>{L(s.lifecycleStage)}</Badge></TD>
                  <TD className="text-xs">{L(s.euAiActCategory)}</TD>
                  <TD><Badge tone={toneForTier(s.riskTier)}>{L(s.riskTier)}</Badge></TD>
                  <TD className="tabular-nums">{s.assuranceScore === null ? <span className="text-muted">—</span> : <span className={s.assuranceScore >= 80 ? "text-success" : s.assuranceScore >= 60 ? "text-warning" : "text-danger"}>{Math.round(s.assuranceScore)}</span>}</TD>
                  <TD className="tabular-nums">{s._count.risks}</TD>
                  <TD className="tabular-nums">{s._count.runs}</TD>
                  <TD className="tabular-nums">{s._count.evidence}</TD>
                  <TD className="text-xs">{s.owner?.name ?? "—"}</TD>
                  <TD className="text-xs text-muted">{fmtAgo(s.updatedAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </>
  );
}
