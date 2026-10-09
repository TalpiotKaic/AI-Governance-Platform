import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser, userCan } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge, toneForStatus, toneForTier } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Select, Input } from "@/components/ui/input";
import { fmtDate} from "@/lib/utils";
import { updateRiskStatusAction } from "./actions";
import { getI18n } from "@/lib/i18n/server";
import { localizeRiskDescription, localizeRiskTitle } from "@/lib/i18n/risks";
import { daysOverdue, ensureOverdueRiskTasks, isOverdue } from "@/lib/risks/due";
import { ScoringHelp } from "./scoring-help";

export const metadata = { title: "Risk Register" };

export default async function RisksPage(props: PageProps<"/risks">) {
  const { t, L, locale } = await getI18n();
  const user = await requireUser();
  const sp = await props.searchParams;
  const dim = typeof sp.dimension === "string" ? sp.dimension : undefined;
  await ensureOverdueRiskTasks(user.orgId);
  const risks = await db.risk.findMany({ where: { orgId: user.orgId, ...(dim ? { dimension: dim as never } : {}) }, orderBy: [{ score: "desc" }, { createdAt: "desc" }], include: { system: true, owner: true, finding: true } });
  const dims = ["ACCURACY_EFFICACY", "BIAS_FAIRNESS", "ROBUSTNESS", "SAFETY", "SECURITY", "PRIVACY", "TRANSPARENCY_EXPLAINABILITY", "ACCOUNTABILITY", "AGENT_BEHAVIOR", "EXPOSURE"];
  // 5x5 heat matrix counts
  const matrix: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
  for (const r of risks) matrix[5 - r.severity][r.likelihood - 1]++;
  return (
    <>
      <PageHeader title={t("Risk Register")} description={t("Portfolio view of AI risks across systems. Dimensions follow Holistic-AI-style multi-dimensional assessment plus agent behaviour; HIGH/CRITICAL test findings register risks automatically with full traceability.")} actions={userCan(user, "risks.write") && <Link href="/risks/new"><Button><Plus className="h-4 w-4" /> {t("Add risk")}</Button></Link>} />
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card><CardHeader className="flex-row items-start justify-between gap-2"><div><CardTitle>{t("Likelihood × Severity")}</CardTitle><CardDescription>{t("Count of risks per cell (severity weighted 3×)")}</CardDescription></div><ScoringHelp /></CardHeader><CardContent>
          <div className="grid grid-cols-[auto_repeat(5,1fr)] gap-1 text-[11px]">
            <div />{[1, 2, 3, 4, 5].map((l) => <div key={l} className="text-center text-muted">L{l}</div>)}
            {matrix.map((row, i) => (<div key={i} className="contents"><div className="pr-1 text-right text-muted">S{5 - i}</div>{row.map((n, j) => { const score = Math.round((((j + 1) + (5 - i) * 3) / 20) * 100); const bg = score >= 80 ? "bg-danger-soft" : score >= 60 ? "bg-warning-soft" : score >= 35 ? "bg-info-soft" : "bg-success-soft"; return <div key={j} className={`flex h-8 items-center justify-center rounded ${bg} ${n ? "font-semibold" : "text-muted"}`} title={`L${j + 1} S${5 - i} → score ${score}`}>{n || ""}</div>; })}</div>))}
          </div>
        </CardContent></Card>
        <Card className="lg:col-span-2"><CardHeader><CardTitle>{t("Filter by dimension")}</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">
          <Link href="/risks"><Badge tone={!dim ? "primary" : "neutral"} className="cursor-pointer">All ({risks.length})</Badge></Link>
          {dims.map((d) => <Link key={d} href={`/risks?dimension=${d}`}><Badge tone={dim === d ? "primary" : "neutral"} className="cursor-pointer">{L(d)}</Badge></Link>)}
        </CardContent></Card>
      </div>
      <div className="rounded-lg border border-border bg-surface">
        <Table><THead><TR><TH>{t("Code")}</TH><TH>{t("Risk")}</TH><TH>{t("System")}</TH><TH>{t("Dimension")}</TH><TH>L</TH><TH>S</TH><TH>{t("Score")}</TH><TH>{t("Source")}</TH><TH>{t("Status")}</TH><TH>{t("Due")}</TH><TH>{t("Update")}</TH></TR></THead><TBody>
          {risks.map((r) => <TR key={r.id}><TD className="font-mono text-xs text-muted">{r.code}</TD><TD><div className="font-medium">{localizeRiskTitle(locale, r.title)}</div>{r.description && <div className="line-clamp-2 text-xs text-muted">{localizeRiskDescription(locale, r.description)}</div>}{r.finding && <Link href={`/evaluations/${r.finding.runId}?tab=findings`} className="text-xs text-primary hover:underline">← finding {r.finding.code}</Link>}</TD><TD className="text-xs"><Link href={`/systems/${r.systemId}?tab=risks`} className="hover:underline">{r.system.code}</Link></TD><TD><Badge>{L(r.dimension)}</Badge></TD><TD className="tabular-nums">{r.likelihood}</TD><TD className="tabular-nums">{r.severity}</TD><TD><Badge tone={toneForTier(r.score >= 80 ? "CRITICAL" : r.score >= 60 ? "HIGH" : r.score >= 35 ? "MEDIUM" : "LOW")}>{Math.round(r.score)}</Badge>{r.residualScore !== null && <div className="text-[10px] text-muted">residual {Math.round(r.residualScore)}</div>}</TD><TD className="text-xs">{L(r.source)}</TD><TD><Badge tone={toneForStatus(r.status)}>{L(r.status)}</Badge></TD><TD className="text-xs text-muted">{isOverdue(r) ? <span className="text-danger" title={t("Overdue")}>{fmtDate(r.dueDate)}<br /><Badge tone="danger">{t("{n} days overdue").replace("{n}", String(daysOverdue(r.dueDate!)))}</Badge></span> : fmtDate(r.dueDate)}</TD>
            <TD>{userCan(user, "risks.write") ? <form action={updateRiskStatusAction.bind(null, r.id)} className="flex items-center gap-1"><Select name="status" defaultValue={r.status} className="h-7 w-28 text-xs">{["IDENTIFIED", "ASSESSED", "MITIGATING", "ACCEPTED", "CLOSED"].map((s) => <option key={s} value={s}>{L(s)}</option>)}</Select><Input name="residualScore" type="number" min={0} max={100} placeholder={t("resid.")} className="h-7 w-16 text-xs" /><Input name="dueDate" type="date" defaultValue={r.dueDate ? r.dueDate.toISOString().slice(0, 10) : ""} title={t("Due date")} className="h-7 w-32 text-xs" /><Button size="sm" variant="ghost" type="submit">{t("Save")}</Button></form> : <span className="text-xs">{L(r.status)}</span>}</TD></TR>)}
        </TBody></Table>
      </div>
    </>
  );
}
