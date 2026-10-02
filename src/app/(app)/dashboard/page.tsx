import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Stat } from "@/components/ui/stat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarList, Sparkline, StatusStack } from "@/components/charts/bar-list";
import { Badge, toneForStatus, toneForTier } from "@/components/ui/badge";
import { VerdictBadge, SeverityBadge } from "@/components/domain/verdict";
import { fmtAgo} from "@/lib/utils";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getI18n } from "@/lib/i18n/server";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { t, L } = await getI18n();
  const user = await requireUser();
  const orgId = user.orgId;
  const [systems, risks, runs, findings, approvals, tasks, incidents, evidenceCount, impls, frameworks] = await Promise.all([
    db.aiSystem.findMany({ where: { orgId }, orderBy: { code: "asc" }, include: { _count: { select: { risks: true, runs: true } } } }),
    db.risk.findMany({ where: { orgId } }),
    db.evaluationRun.findMany({ where: { orgId }, orderBy: { createdAt: "desc" }, take: 8, include: { system: true } }),
    db.finding.findMany({ where: { system: { orgId }, status: { in: ["OPEN", "MITIGATING"] } }, orderBy: [{ severity: "desc" }, { createdAt: "desc" }], take: 6, include: { system: true } }),
    db.approval.count({ where: { orgId, decision: "PENDING" } }),
    db.task.count({ where: { orgId, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    db.incident.count({ where: { orgId, status: { in: ["REPORTED", "INVESTIGATING"] } } }),
    db.evidence.count({ where: { orgId, status: "VALID" } }),
    db.controlImplementation.findMany({ where: { system: { orgId } } }),
    db.framework.findMany({ include: { _count: { select: { requirements: true } } } }),
  ]);
  const highRisk = systems.filter((s) => s.riskTier === "HIGH" || s.riskTier === "CRITICAL").length;
  const avgScore = systems.filter((s) => s.assuranceScore !== null).reduce((a, s, _, arr) => a + (s.assuranceScore ?? 0) / arr.length, 0);
  const openFindings = await db.finding.count({ where: { system: { orgId }, status: { in: ["OPEN", "MITIGATING"] } } });
  const critFindings = await db.finding.count({ where: { system: { orgId }, status: { in: ["OPEN", "MITIGATING"] }, severity: "CRITICAL" } });
  const verified = impls.filter((i) => i.status === "VERIFIED").length, implemented = impls.filter((i) => i.status === "IMPLEMENTED").length, inProg = impls.filter((i) => i.status === "IN_PROGRESS").length;
  const runsAsc = [...runs].reverse();
  const scoreTrend = runsAsc.map((r) => Number((r.summary as { assuranceScore?: number }).assuranceScore ?? 0)).filter((n) => n > 0);
  const riskByDim = Object.entries(risks.reduce<Record<string, number>>((acc, r) => { acc[r.dimension] = (acc[r.dimension] ?? 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <PageHeader title={t("Dashboard")} description={`${t("Governance, evaluation and assurance posture for")} ${user.orgName}.`} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label={t("AI systems")} value={systems.length} hint={`${highRisk} ${t("high/critical tier")}`} />
        <Stat label={t("Avg. assurance score")} value={systems.some((s) => s.assuranceScore !== null) ? Math.round(avgScore) : "—"} hint={t("across evaluated systems")} tone={avgScore >= 80 ? "success" : avgScore >= 60 ? "warning" : "danger"} />
        <Stat label={t("Open findings")} value={openFindings} hint={`${critFindings} ${t("critical")}`} tone={critFindings ? "danger" : openFindings ? "warning" : "success"} />
        <Stat label={t("Open risks")} value={risks.filter((r) => r.status !== "CLOSED" && r.status !== "ACCEPTED").length} hint={`${risks.length} ${t("total in register")}`} />
        <Stat label={t("Pending approvals")} value={approvals} hint={`${tasks} ${t("open tasks")}`} tone={approvals ? "info" : undefined} />
        <Stat label={t("Valid evidence")} value={evidenceCount} hint={`${incidents} ${t("open incidents")}`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>{t("Assurance score by system")}</CardTitle><CardDescription>{t("Latest AI Assurance Score (0–100) from completed evaluation runs. Status colour: ≥80 good, 60–79 warning, &lt;60 failing.")}</CardDescription></CardHeader>
          <CardContent>
            <BarList tone="status" max={100} items={systems.filter((s) => s.assuranceScore !== null).map((s) => ({ label: `${s.code} ${s.name}`, value: s.assuranceScore ?? 0, hint: L(s.type) }))} />
            {systems.some((s) => s.assuranceScore === null) && <p className="mt-3 text-xs text-muted">Not yet evaluated: {systems.filter((s) => s.assuranceScore === null).map((s) => s.code).join(", ")}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("Score trend")}</CardTitle><CardDescription>Across the last {scoreTrend.length} completed runs</CardDescription></CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div><p className="text-3xl font-semibold tabular-nums">{scoreTrend.length ? scoreTrend[scoreTrend.length - 1] : "—"}</p><p className="text-xs text-muted">{t("latest run score")}</p></div>
              <Sparkline values={scoreTrend} width={160} height={48} />
            </div>
            <div className="mt-4">
              <p className="mb-1 text-xs font-medium text-muted">Control implementation ({impls.length})</p>
              <StatusStack pass={verified} warn={implemented + inProg} fail={impls.length - verified - implemented - inProg} labels={["Verified", "Implemented / in progress", "Not started"]} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>{t("Top open findings")}</CardTitle><CardDescription>{t("From evaluation runs; HIGH/CRITICAL findings auto-register risks.")}</CardDescription></CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <THead><TR><TH>{t("Finding")}</TH><TH>{t("System")}</TH><TH>{t("Category")}</TH><TH>{t("Severity")}</TH></TR></THead>
              <TBody>
                {findings.map((f) => (
                  <TR key={f.id}>
                    <TD><Link href={`/evaluations/${f.runId}?tab=findings`} className="hover:underline"><span className="font-mono text-xs text-muted">{f.code}</span> {f.title}</Link></TD>
                    <TD className="text-xs text-muted">{f.system.code}</TD>
                    <TD><Badge>{L(f.category)}</Badge></TD>
                    <TD><SeverityBadge severity={f.severity} /></TD>
                  </TR>
                ))}
                {findings.length === 0 && <TR><TD colSpan={4} className="text-center text-muted">{t("No open findings")}</TD></TR>}
              </TBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("Risk register by dimension")}</CardTitle><CardDescription>{risks.length} risks</CardDescription></CardHeader>
          <CardContent><BarList items={riskByDim.map(([k, v]) => ({ label: L(k), value: v }))} /></CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>{t("Recent evaluation runs")}</CardTitle></CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <THead><TR><TH>{t("Run")}</TH><TH>{t("System")}</TH><TH>{t("Mode")}</TH><TH>{t("Status")}</TH><TH>{t("Verdict")}</TH><TH>{t("Score")}</TH><TH>{t("When")}</TH></TR></THead>
              <TBody>
                {runs.map((r) => (
                  <TR key={r.id}>
                    <TD><Link href={`/evaluations/${r.id}`} className="hover:underline"><span className="font-mono text-xs text-muted">{r.code}</span> {r.name}</Link></TD>
                    <TD className="text-xs text-muted">{r.system.code}</TD>
                    <TD><Badge tone={r.mode === "LIVE" ? "accent" : "warning"}>{r.mode}</Badge></TD>
                    <TD><Badge tone={toneForStatus(r.status)}>{L(r.status)}</Badge></TD>
                    <TD><VerdictBadge verdict={r.verdict} /></TD>
                    <TD className="tabular-nums">{(r.summary as { assuranceScore?: number }).assuranceScore ?? "—"}</TD>
                    <TD className="text-xs text-muted">{fmtAgo(r.createdAt)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("Frameworks")}</CardTitle><CardDescription>{t("Requirement libraries loaded")}</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {frameworks.map((f) => (
              <Link key={f.id} href={`/frameworks/${f.code}`} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:bg-surface-2">
                <span>{L(f.code)}</span><span className="text-xs text-muted">{f._count.requirements} requirements</span>
              </Link>
            ))}
            <div className="pt-2 text-xs text-muted">Systems by tier: {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((t) => <Badge key={t} tone={toneForTier(t)} className="ml-1">{L(t)} {systems.filter((s) => s.riskTier === t).length}</Badge>)}</div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
