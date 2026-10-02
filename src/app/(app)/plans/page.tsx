import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge, toneForStatus } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR, EmptyState } from "@/components/ui/table";
import { fmtDate} from "@/lib/utils";
import { getI18n } from "@/lib/i18n/server";

export const metadata = { title: "Evaluation Plans" };

export default async function PlansPage() {
  const { t, L } = await getI18n();
  const user = await requireUser();
  const plans = await db.evaluationPlan.findMany({ where: { orgId: user.orgId }, orderBy: { createdAt: "desc" }, include: { system: true, createdBy: true, _count: { select: { scenarios: true, runs: true } } } });
  return (
    <>
      <PageHeader title={t("Evaluation Plans")} description={t("ARIA-style evaluation designs (NIST AI 200-3 worksheets B.1–B.5): scope, design, materials, infrastructure and implementation. A plan selects scenarios from the library and is executed as runs.")} actions={<Link href="/plans/new"><Button><Plus className="h-4 w-4" /> {t("New plan")}</Button></Link>} />
      {plans.length === 0 ? <EmptyState title={t("No evaluation plans")} action={<Link href="/plans/new"><Button>{t("New plan")}</Button></Link>} /> : (
        <div className="rounded-lg border border-border bg-surface"><Table><THead><TR><TH>{t("Plan")}</TH><TH>{t("System")}</TH><TH>{t("Target concept")}</TH><TH>{t("Scenarios")}</TH><TH>{t("Runs")}</TH><TH>{t("Status")}</TH><TH>{t("Created")}</TH></TR></THead><TBody>
          {plans.map((p) => <TR key={p.id}><TD><Link href={`/plans/${p.id}`} className="font-medium hover:underline">{p.name}</Link><div className="text-xs text-muted">{p.createdBy?.name}</div></TD><TD className="text-xs">{p.system.code} {p.system.name}</TD><TD className="line-clamp-2 text-xs text-muted">{(p.scope as { targetConcept?: string }).targetConcept}</TD><TD className="tabular-nums">{p._count.scenarios}</TD><TD className="tabular-nums">{p._count.runs}</TD><TD><Badge tone={toneForStatus(p.status)}>{L(p.status)}</Badge></TD><TD className="text-xs text-muted">{fmtDate(p.createdAt)}</TD></TR>)}
        </TBody></Table></div>
      )}
    </>
  );
}
