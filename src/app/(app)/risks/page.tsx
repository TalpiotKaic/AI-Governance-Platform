import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { requireUser, userCan } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge, toneForStatus, toneForTier } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { fmtDate, riskTierFromScore } from "@/lib/utils";
import { getI18n } from "@/lib/i18n/server";
import { localizeRiskDescription, localizeRiskMitigation, localizeRiskTitle } from "@/lib/i18n/risks";
import { OPEN_RISK_STATUSES, daysOverdue, ensureOverdueRiskTasks, isOverdue } from "@/lib/risks/due";
import { ScoringHelp } from "./scoring-help";
import { RiskEditor } from "./risk-editor";
import { RiskSummary } from "./risk-summary";

export const metadata = { title: "Risk Register" };

const DIMS = ["ACCURACY_EFFICACY", "BIAS_FAIRNESS", "ROBUSTNESS", "SAFETY", "SECURITY", "PRIVACY", "TRANSPARENCY_EXPLAINABILITY", "ACCOUNTABILITY", "AGENT_BEHAVIOR", "EXPOSURE"];

export default async function RisksPage(props: PageProps<"/risks">) {
  const { t, L, locale } = await getI18n();
  const user = await requireUser();
  const sp = await props.searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const dim = str("dimension") && DIMS.includes(str("dimension")!) ? str("dimension") : undefined;
  const view = str("view") === "residual" ? "residual" : "inherent";
  const includeClosed = str("all") === "1";
  const editId = str("edit");
  // Build register URLs that keep the current view parameters.
  const href = (o: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const merged: Record<string, string | undefined> = { dimension: dim, view: view === "residual" ? "residual" : undefined, all: includeClosed ? "1" : undefined, ...o };
    for (const [k, v] of Object.entries(merged)) if (v) q.set(k, v);
    const s = q.toString();
    return s ? `/risks?${s}` : "/risks";
  };
  const ret = new URLSearchParams(Object.entries({ dimension: dim, view: view === "residual" ? "residual" : undefined, all: includeClosed ? "1" : undefined }).filter(([, v]) => v) as [string, string][]).toString();

  await ensureOverdueRiskTasks(user.orgId);
  const risks = await db.risk.findMany({ where: { orgId: user.orgId, ...(dim ? { dimension: dim as never } : {}) }, orderBy: [{ score: "desc" }, { createdAt: "desc" }], include: { system: true, owner: true, finding: true } });
  const canWrite = userCan(user, "risks.write");
  const total = dim ? await db.risk.count({ where: { orgId: user.orgId } }) : risks.length;

  // Heat map scope. Inherent view: open risks. Residual view: open + accepted (risk still carried).
  // The checkbox adds the remaining statuses (closed, and accepted in the inherent view).
  const isOpen = (st: string) => (OPEN_RISK_STATUSES as readonly string[]).includes(st);
  const inScope = (st: string) => isOpen(st) || (view === "residual" && st === "ACCEPTED");
  const charted = risks.filter((r) => includeClosed || inScope(r.status));
  const excluded = risks.length - charted.length;
  const matrix: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
  let notAssessed = 0;
  for (const r of charted) {
    const hasResidual = r.residualLikelihood !== null && r.residualSeverity !== null;
    if (view === "residual" && !hasResidual) notAssessed++;
    const l = view === "residual" && hasResidual ? r.residualLikelihood! : r.likelihood;
    const s = view === "residual" && hasResidual ? r.residualSeverity! : r.severity;
    matrix[5 - s][l - 1]++;
  }
  const tone = (score: number) => toneForTier(riskTierFromScore(score));
  const seg = (active: boolean) => `rounded px-2 py-1 text-xs font-medium ${active ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"}`;

  return (
    <>
      <PageHeader title={t("Risk Register")} description={t("Portfolio view of AI risks across systems. Dimensions follow Holistic-AI-style multi-dimensional assessment plus agent behaviour; HIGH/CRITICAL test findings register risks automatically with full traceability.")} actions={canWrite && <Link href="/risks/new"><Button><Plus className="h-4 w-4" /> {t("Add risk")}</Button></Link>} />
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card><CardHeader className="flex-row items-start justify-between gap-2"><div><CardTitle>{t("Likelihood × Severity")}</CardTitle><CardDescription>{t("Count of risks per cell (severity weighted 3×)")}</CardDescription></div><ScoringHelp /></CardHeader><CardContent>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-md border border-border p-0.5" role="group" aria-label={t("Heat-map view")}>
              <Link href={href({ view: undefined })} className={seg(view === "inherent")} aria-current={view === "inherent" ? "true" : undefined}>{t("Inherent")}</Link>
              <Link href={href({ view: "residual" })} className={seg(view === "residual")} aria-current={view === "residual" ? "true" : undefined}>{t("Residual")}</Link>
            </div>
            <Link href={href({ all: includeClosed ? undefined : "1" })} className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground">
              <span className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded border ${includeClosed ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{includeClosed ? "✓" : ""}</span>{view === "residual" ? t("Include closed") : t("Include closed & accepted")}
            </Link>
          </div>
          <div className="grid grid-cols-[auto_repeat(5,1fr)] gap-1 text-[11px]">
            <div />{[1, 2, 3, 4, 5].map((l) => <div key={l} className="text-center text-muted">L{l}</div>)}
            {matrix.map((row, i) => (<div key={i} className="contents"><div className="pr-1 text-right text-muted">S{5 - i}</div>{row.map((n, j) => { const score = Math.round((((j + 1) + (5 - i) * 3) / 20) * 100); const bg = score >= 80 ? "bg-danger-soft" : score >= 60 ? "bg-warning-soft" : score >= 35 ? "bg-info-soft" : "bg-success-soft"; return <div key={j} className={`flex h-8 items-center justify-center rounded ${bg} ${n ? "font-semibold" : "text-muted"}`} title={`L${j + 1} S${5 - i} → ${score}`}>{n || ""}</div>; })}</div>))}
          </div>
          <p className="mt-2 text-[11px] text-muted">
            {includeClosed ? t("{n} risks charted (all statuses).").replace("{n}", String(charted.length))
              : view === "residual" ? t("{n} open and accepted risks charted.").replace("{n}", String(charted.length))
              : t("{n} open risks charted.").replace("{n}", String(charted.length))}
            {!includeClosed && excluded > 0 && <> {(view === "residual" ? t("{n} closed excluded — turn on “Include closed” to show them.") : t("{n} closed or accepted excluded — turn on “Include closed & accepted” to show them.")).replace("{n}", String(excluded))}</>}
            {view === "residual" && notAssessed > 0 && <> {t("{n} without a residual assessment are shown at their inherent position.").replace("{n}", String(notAssessed))}</>}
          </p>
        </CardContent></Card>
        <Card className="lg:col-span-2"><CardHeader><CardTitle>{t("Filter by dimension")}</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">
          <Link href={href({ dimension: undefined })}><Badge tone={!dim ? "primary" : "neutral"} className="cursor-pointer">{t("All")} ({total})</Badge></Link>
          {DIMS.map((d) => <Link key={d} href={href({ dimension: d })}><Badge tone={dim === d ? "primary" : "neutral"} className="cursor-pointer">{L(d)}</Badge></Link>)}
          <div className="mt-3 w-full border-t border-border pt-4">
            <p className="mb-3 text-sm font-medium">{dim ? t("Summary: {dim}").replace("{dim}", L(dim)) : t("Register summary")}</p>
            <RiskSummary risks={risks} />
          </div>
        </CardContent></Card>
      </div>
      <div className="rounded-lg border border-border bg-surface">
        <Table><THead><TR><TH>{t("Code")}</TH><TH>{t("Risk")}</TH><TH>{t("System")}</TH><TH>{t("Dimension")}</TH><TH>L</TH><TH>S</TH><TH>{t("Score")}</TH><TH>{t("Source")}</TH><TH>{t("Status")}</TH><TH>{t("Due")}</TH><TH>{t("Update")}</TH></TR></THead><TBody>
          {risks.map((r) => {
            const editing = editId === r.id && canWrite;
            return [
              <TR key={r.id} className={editing ? "bg-primary-soft/20" : undefined}>
                <TD className="font-mono text-xs text-muted">{r.code}</TD>
                <TD><div className="font-medium">{localizeRiskTitle(locale, r.title)}</div>{r.description && <div className="line-clamp-2 text-xs text-muted">{localizeRiskDescription(locale, r.description)}</div>}{r.mitigation && <div className="line-clamp-1 text-xs text-muted">{t("Mitigation:")} {localizeRiskMitigation(locale, r.mitigation)}</div>}{r.finding && <Link href={`/evaluations/${r.finding.runId}?tab=findings`} className="text-xs text-primary hover:underline">← finding {r.finding.code}</Link>}</TD>
                <TD className="text-xs"><Link href={`/systems/${r.systemId}?tab=risks`} className="hover:underline">{r.system.code}</Link></TD>
                <TD><Badge>{L(r.dimension)}</Badge></TD>
                <TD className="tabular-nums">{r.likelihood}</TD>
                <TD className="tabular-nums">{r.severity}</TD>
                <TD><Badge tone={tone(r.score)}>{Math.round(r.score)}</Badge>{r.residualScore !== null && <div className="mt-0.5 whitespace-nowrap text-[10px] text-muted">{t("Residual")} <Badge tone={tone(r.residualScore)} className="px-1 py-0 text-[10px]">{Math.round(r.residualScore)}</Badge>{r.residualLikelihood !== null && r.residualSeverity !== null && <> L{r.residualLikelihood}·S{r.residualSeverity}</>}</div>}</TD>
                <TD className="text-xs">{L(r.source)}</TD>
                <TD><Badge tone={toneForStatus(r.status)}>{L(r.status)}</Badge></TD>
                <TD className="text-xs text-muted">{isOverdue(r) ? <span className="text-danger" title={t("Overdue")}>{fmtDate(r.dueDate)}<br /><Badge tone="danger">{t("{n} days overdue").replace("{n}", String(daysOverdue(r.dueDate!)))}</Badge></span> : fmtDate(r.dueDate)}</TD>
                <TD>{canWrite ? (editing ? <span className="text-xs text-primary">{t("Editing…")}</span> : <Link href={href({ edit: r.id })} scroll={false}><Button size="sm" variant="outline"><Pencil className="h-3.5 w-3.5" /> {t("Edit")}</Button></Link>) : <span className="text-xs text-muted">—</span>}</TD>
              </TR>,
              editing ? <TR key={`${r.id}-edit`}><TD colSpan={11} className="bg-surface">
                <RiskEditor key={`${r.id}-${r.updatedAt.getTime()}`} id={r.id} status={r.status} likelihood={r.likelihood} severity={r.severity} residualLikelihood={r.residualLikelihood} residualSeverity={r.residualSeverity} residualScore={r.residualScore} dueDate={r.dueDate ? r.dueDate.toISOString().slice(0, 10) : ""} mitigation={r.mitigation ?? ""} ret={ret} cancelHref={href({})} />
              </TD></TR> : null,
            ];
          })}
        </TBody></Table>
      </div>
    </>
  );
}
