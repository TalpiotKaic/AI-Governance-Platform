import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FileText, RotateCcw } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge, toneForStatus } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/progress";
import { Tabs } from "@/components/ui/tabs";
import { Table, TBody, TD, TH, THead, TR, EmptyState } from "@/components/ui/table";
import { Select, Input } from "@/components/ui/input";
import { VerdictBadge, SeverityBadge } from "@/components/domain/verdict";
import { DialogueViewer } from "@/components/domain/dialogue";
import { BarList, StatusStack } from "@/components/charts/bar-list";
import { enumLabel, fmtDate, num, pct } from "@/lib/utils";
import { RunProgress } from "./run-progress";
import { rerunAction, updateFindingStatusAction, addHumanAnnotationAction } from "../actions";
import type { AnnotationItem } from "@/lib/eval/types";

export default async function RunPage(props: PageProps<"/evaluations/[id]">) {
  const user = await requireUser();
  const { id } = await props.params;
  const sp = await props.searchParams;
  const tab = typeof sp.tab === "string" ? sp.tab : "summary";
  const run = await db.evaluationRun.findFirst({ where: { id, orgId: user.orgId }, include: { system: true, plan: true, createdBy: true, metrics: { orderBy: [{ category: "asc" }, { name: "asc" }] }, findings: { orderBy: [{ severity: "desc" }, { code: "asc" }], include: { controls: { include: { control: true } }, risk: true } }, sessions: { orderBy: { startedAt: "asc" }, include: { scenario: { include: { method: true } }, turns: { orderBy: { index: "asc" } }, annotations: true } }, evidence: true, reports: { include: { report: true } } } });
  if (!run) notFound();
  const summary = run.summary as { assuranceScore?: number; byCategory?: Record<string, number>; counts?: Record<string, number>; target?: string; judge?: string };
  const env = run.environment as Record<string, unknown>;
  const sessionId = typeof sp.session === "string" ? sp.session : run.sessions[0]?.id;
  const session = run.sessions.find((s) => s.id === sessionId);
  const fmtVal = (m: (typeof run.metrics)[number]) => m.unit === "ms" ? `${Math.round(m.value)} ms` : m.unit === "score" ? num(m.value, 2) : pct(m.value, 1);
  const fmtThr = (m: (typeof run.metrics)[number]) => `${m.direction === "lower" ? "≤" : "≥"} ${m.unit === "ms" ? `${m.threshold} ms` : m.unit === "score" ? m.threshold : pct(m.threshold ?? 0, 0)}`;
  const tabs = [{ key: "summary", label: "Summary" }, { key: "metrics", label: "Metrics", count: run.metrics.length }, { key: "findings", label: "Findings", count: run.findings.length }, { key: "sessions", label: "Sessions & dialogues", count: run.sessions.length }, { key: "evidence", label: "Evidence & reports", count: run.evidence.length + run.reports.length }];
  const byScenario = new Map<string, { code: string; name: string; type: string; cat: string; pass: number; fail: number; ne: number }>();
  for (const s of run.sessions) { const k = s.scenario.code; const e = byScenario.get(k) ?? { code: k, name: s.scenario.name, type: s.testingType, cat: s.scenario.method.category, pass: 0, fail: 0, ne: 0 }; if (s.verdict === "PASS") e.pass++; else if (s.verdict === "FAIL") e.fail++; else e.ne++; byScenario.set(k, e); }
  return (
    <>
      <PageHeader title={`${run.code} · ${run.name}`} crumbs={[{ label: "Evaluation Runs", href: "/evaluations" }, { label: run.code }]} description={<>{run.system.code} · {run.system.name}{run.plan && <> · plan <Link href={`/plans/${run.planId}`} className="underline">{run.plan.name}</Link></>}</> as unknown as string}
        actions={<>
          <Link href={`/reports/new?systemId=${run.systemId}&type=EVALUATION_REPORT&runId=${run.id}`}><Button variant="outline"><FileText className="h-4 w-4" /> Evaluation report</Button></Link>
          <Link href={`/reports/new?systemId=${run.systemId}&type=VERIFICATION_REPORT&runId=${run.id}`}><Button variant="outline"><FileText className="h-4 w-4" /> Verification report</Button></Link>
          {run.status !== "RUNNING" && <form action={rerunAction.bind(null, run.id)}><Button type="submit"><RotateCcw className="h-4 w-4" /> Re-run</Button></form>}
        </>} />
      <div className="mb-3 flex flex-wrap items-center gap-2"><Badge tone={run.mode === "LIVE" ? "accent" : "warning"}>{run.mode} mode</Badge><Badge tone={toneForStatus(run.status)}>{enumLabel(run.status)}</Badge><VerdictBadge verdict={run.verdict} />{summary.target && <Badge>{summary.target}</Badge>}{summary.judge && <Badge>judge: {summary.judge}</Badge>}<span className="text-xs text-muted">{fmtDate(run.startedAt, true)} → {fmtDate(run.finishedAt, true)} · by {run.createdBy?.name}</span></div>
      <RunProgress status={run.status} progress={run.progress} />
      {run.error && <div className="mb-4 rounded-md border border-danger/40 bg-danger-soft/40 px-4 py-3 text-sm text-danger">Run failed: {run.error}</div>}
      {run.mode === "DEMO" && run.status === "COMPLETED" && <div className="mb-4 rounded-md border border-warning/40 bg-warning-soft/40 px-4 py-2 text-xs text-warning">Demo mode: results come from a simulated target and illustrate the workflow only.</div>}
      <Suspense><Tabs tabs={tabs} /></Suspense>

      {tab === "summary" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card><CardHeader><CardTitle>AI Assurance Score</CardTitle><CardDescription>Severity-weighted aggregate across categories</CardDescription></CardHeader><CardContent className="flex items-center gap-4"><ScoreRing value={summary.assuranceScore ?? null} size={96} /><div className="text-sm"><p>Sessions: <b>{summary.counts?.sessions ?? run.sessions.length}</b></p><p>Passed: <b className="text-success">{summary.counts?.passed ?? 0}</b> · Failed: <b className="text-danger">{summary.counts?.failed ?? 0}</b></p><p>Critical findings: <b>{summary.counts?.critical ?? 0}</b></p></div></CardContent></Card>
          <Card className="lg:col-span-2"><CardHeader><CardTitle>Category scores</CardTitle><CardDescription>0–100 per test category; weights: security/safety/agent 1.2, privacy 1.1, fairness/quality 1.0, robustness/transparency 0.8, performance 0.5</CardDescription></CardHeader><CardContent><BarList tone="status" max={100} items={Object.entries(summary.byCategory ?? {}).map(([k, v]) => ({ label: enumLabel(k), value: v }))} /></CardContent></Card>
          <Card className="lg:col-span-2"><CardHeader><CardTitle>Results by scenario</CardTitle></CardHeader><CardContent className="px-0 pb-0"><Table><THead><TR><TH>Scenario</TH><TH>Testing type</TH><TH>Category</TH><TH>Sessions</TH><TH>Outcome</TH></TR></THead><TBody>{[...byScenario.values()].map((s) => <TR key={s.code}><TD><span className="font-mono text-xs text-muted">{s.code}</span> {s.name}</TD><TD><Badge tone={s.type === "RED_TEAMING" ? "danger" : s.type === "USER_TESTING" ? "accent" : "info"}>{enumLabel(s.type)}</Badge></TD><TD><Badge>{enumLabel(s.cat)}</Badge></TD><TD className="tabular-nums">{s.pass + s.fail + s.ne}</TD><TD className="w-56"><StatusStack pass={s.pass} warn={s.ne} fail={s.fail} labels={["Pass", "N/E", "Fail"]} /></TD></TR>)}</TBody></Table></CardContent></Card>
          <Card><CardHeader><CardTitle>Test environment</CardTitle></CardHeader><CardContent><dl className="space-y-1 text-sm">{Object.entries(env).map(([k, v]) => <div key={k} className="flex justify-between gap-2 border-b border-border/60 pb-1"><dt className="text-muted">{k}</dt><dd className="truncate">{v === null || v === undefined ? "—" : String(v)}</dd></div>)}</dl></CardContent></Card>
        </div>
      )}

      {tab === "metrics" && (
        <Card><CardHeader><CardTitle>Metrics vs acceptance thresholds</CardTitle><CardDescription>WARN band: within 1.5× of a lower-is-better threshold or within 10% below a higher-is-better threshold.</CardDescription></CardHeader><CardContent className="px-0 pb-0">
          {run.metrics.length ? <Table><THead><TR><TH>Category</TH><TH>Metric</TH><TH className="text-right">Measured</TH><TH className="text-right">Threshold</TH><TH className="text-right">n</TH><TH>Verdict</TH></TR></THead><TBody>{run.metrics.map((m) => <TR key={m.id}><TD><Badge>{enumLabel(m.category)}</Badge></TD><TD>{m.name}<div className="font-mono text-[10px] text-muted">{m.metricKey}</div></TD><TD className="text-right tabular-nums">{fmtVal(m)}</TD><TD className="text-right tabular-nums text-muted">{fmtThr(m)}</TD><TD className="text-right tabular-nums text-muted">{m.sampleSize ?? "—"}</TD><TD><VerdictBadge verdict={m.verdict} /></TD></TR>)}</TBody></Table> : <div className="p-5"><EmptyState title="No metrics yet" description={run.status === "RUNNING" ? "Metrics are computed when the run completes." : undefined} /></div>}
        </CardContent></Card>
      )}

      {tab === "findings" && (
        <div className="space-y-3">
          {run.findings.length === 0 && <EmptyState title="No findings" description="All sessions passed their annotation checks." />}
          {run.findings.map((f) => <Card key={f.id}><CardContent className="pt-4">
            <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs text-muted">{f.code}</span><SeverityBadge severity={f.severity} /><Badge>{enumLabel(f.category)}</Badge>{f.tactic && <Badge tone="accent">{f.tactic}</Badge>}<Badge tone={toneForStatus(f.status)}>{enumLabel(f.status)}</Badge><span className="font-medium">{f.title}</span></div>
            {f.description && <p className="mt-2 text-sm text-muted">{f.description}</p>}
            {f.evidenceExcerpt && <blockquote className="mt-2 border-l-2 border-border pl-3 text-xs italic">“{f.evidenceExcerpt}”</blockquote>}
            {f.recommendation && <p className="mt-2 text-sm"><span className="font-semibold">Recommendation: </span>{f.recommendation}</p>}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="text-muted">Controls: {f.controls.map((c) => c.control.code).join(", ") || "—"}{f.risk && <> · Risk <Link href="/risks" className="text-primary hover:underline">{f.risk.code}</Link></>}{f.sessionId && <> · <Link href={`/evaluations/${run.id}?tab=sessions&session=${f.sessionId}`} className="text-primary hover:underline">view dialogue</Link></>}</div>
              <form action={updateFindingStatusAction.bind(null, f.id)} className="flex items-center gap-1"><Select name="status" defaultValue={f.status} className="h-7 w-36 text-xs">{["OPEN", "MITIGATING", "MITIGATED", "ACCEPTED", "FALSE_POSITIVE"].map((s) => <option key={s} value={s}>{enumLabel(s)}</option>)}</Select><Button size="sm" variant="ghost" type="submit">Save</Button></form>
            </div>
          </CardContent></Card>)}
        </div>
      )}

      {tab === "sessions" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
          <Card className="max-h-[75vh] overflow-y-auto scroll-thin"><CardHeader><CardTitle>Sessions ({run.sessions.length})</CardTitle><CardDescription>SessionID · TesterID · ScenarioID · TestingType</CardDescription></CardHeader><CardContent className="space-y-1 px-2">
            {run.sessions.map((s) => <Link key={s.id} href={`/evaluations/${run.id}?tab=sessions&session=${s.id}`} className={`block rounded-md border px-2 py-1.5 text-xs ${s.id === sessionId ? "border-primary bg-primary-soft/40" : "border-border hover:bg-surface-2"}`}><div className="flex items-center justify-between"><span className="font-mono">{s.scenario.code} · {s.promptRef}</span><VerdictBadge verdict={s.verdict} /></div><div className="mt-0.5 text-muted">{enumLabel(s.testingType)} · {s.testerId}</div></Link>)}
          </CardContent></Card>
          {session ? (
            <div className="space-y-4">
              <Card><CardHeader><CardTitle>{session.scenario.name} — prompt {session.promptRef}</CardTitle><CardDescription>Session {session.id} · {enumLabel(session.testingType)} · tester {session.testerId} · {fmtDate(session.startedAt, true)} · <VerdictBadge verdict={session.verdict} /> {session.severity && <SeverityBadge severity={session.severity} />}</CardDescription></CardHeader><CardContent><DialogueViewer turns={session.turns} /></CardContent></Card>
              <Card><CardHeader><CardTitle>Annotations</CardTitle><CardDescription>Rule-based, LLM-as-judge or demo ground truth; add a human annotation to validate (NIST AI 200-3 §6 adjudication).</CardDescription></CardHeader><CardContent className="px-0 pb-0">
                <Table><THead><TR><TH>Item</TH><TH>Question</TH><TH>Value</TH><TH>Annotator</TH><TH>Rationale</TH><TH>Conf.</TH></TR></THead><TBody>{session.annotations.map((a) => { const item = (session.scenario.annotationSchema as unknown as AnnotationItem[]).find((i) => i.key === a.itemKey); return <TR key={a.id}><TD className="font-mono text-xs">{a.itemKey}</TD><TD className="text-xs text-muted">{item?.question ?? "—"}</TD><TD><Badge tone={a.value === "yes" && !["faithful", "appropriate_refusal", "expected_tool_called", "tool_args_correct", "ai_disclosed", "contains_expected", "approval_or_escalation"].includes(a.itemKey) ? "danger" : a.value === "no" && ["faithful", "appropriate_refusal", "expected_tool_called", "tool_args_correct", "ai_disclosed", "contains_expected", "approval_or_escalation"].includes(a.itemKey) ? "danger" : "neutral"}>{a.value}</Badge></TD><TD><Badge tone={a.annotator === "HUMAN" ? "accent" : a.annotator === "LLM_JUDGE" ? "info" : "neutral"}>{enumLabel(a.annotator)}</Badge></TD><TD className="text-xs text-muted">{a.rationale ?? "—"}</TD><TD className="text-xs tabular-nums">{a.confidence ?? "—"}</TD></TR>; })}</TBody></Table>
                <form action={addHumanAnnotationAction.bind(null, session.id)} className="flex flex-wrap items-end gap-2 border-t border-border p-3"><div><label className="mb-1 block text-[11px] text-muted">Item</label><Select name="itemKey" className="h-8 w-48 text-xs">{(session.scenario.annotationSchema as unknown as AnnotationItem[]).map((i) => <option key={i.key} value={i.key}>{i.key}</option>)}</Select></div><div><label className="mb-1 block text-[11px] text-muted">Value</label><Input name="value" className="h-8 w-28 text-xs" placeholder="yes / no / 1-5" required /></div><div className="flex-1"><label className="mb-1 block text-[11px] text-muted">Rationale</label><Input name="rationale" className="h-8 text-xs" /></div><Button size="sm" type="submit">Add human annotation</Button></form>
              </CardContent></Card>
            </div>
          ) : <EmptyState title="No sessions yet" />}
        </div>
      )}

      {tab === "evidence" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card><CardHeader><CardTitle>Generated evidence</CardTitle><CardDescription>One record per test category, linked to the harmonized controls of the test methods used.</CardDescription></CardHeader><CardContent>{run.evidence.length ? <ul className="space-y-2 text-sm">{run.evidence.map((e) => <li key={e.id} className="rounded-md border border-border px-3 py-2"><Link href={`/evidence/${e.id}`} className="font-medium hover:underline">{e.title}</Link><div className="text-xs text-muted"><Badge className="mr-1">{enumLabel(e.type)}</Badge><Badge tone={toneForStatus(e.status)}>{enumLabel(e.status)}</Badge> {e.description}</div></li>)}</ul> : <p className="text-sm text-muted">Evidence is generated when the run completes.</p>}</CardContent></Card>
          <Card><CardHeader><CardTitle>Reports referencing this run</CardTitle></CardHeader><CardContent>{run.reports.length ? <ul className="space-y-2 text-sm">{run.reports.map((r) => <li key={r.reportId} className="rounded-md border border-border px-3 py-2"><Link href={`/reports/${r.reportId}`} className="font-medium hover:underline"><span className="font-mono text-xs text-muted">{r.report.code}</span> {enumLabel(r.report.type)} v{r.report.version}</Link> <Badge tone={toneForStatus(r.report.status)}>{enumLabel(r.report.status)}</Badge></li>)}</ul> : <p className="text-sm text-muted">No reports yet. Generate an evaluation or verification report from the buttons above.</p>}</CardContent></Card>
        </div>
      )}
    </>
  );
}
