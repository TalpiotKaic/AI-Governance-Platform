import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, toneForStatus } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { VerdictBadge } from "@/components/domain/verdict";
import { enumLabel, fmtAgo } from "@/lib/utils";
import { setPlanStatusAction } from "../actions";

const str = (v: unknown) => (Array.isArray(v) ? v.join("; ") : v ? String(v) : "—");
function KV({ items }: { items: [string, unknown][] }) {
  return <dl className="grid grid-cols-1 gap-2 text-sm">{items.map(([k, v]) => <div key={k} className="border-b border-border/60 pb-1.5"><dt className="text-[11px] font-medium uppercase tracking-wide text-muted">{k}</dt><dd className="whitespace-pre-wrap">{str(v)}</dd></div>)}</dl>;
}

export default async function PlanPage(props: PageProps<"/plans/[id]">) {
  const user = await requireUser();
  const { id } = await props.params;
  const p = await db.evaluationPlan.findFirst({ where: { id, orgId: user.orgId }, include: { system: true, scenarios: { include: { scenario: { include: { method: true } } } }, runs: { orderBy: { createdAt: "desc" } } } });
  if (!p) notFound();
  const J = (v: unknown) => (v as Record<string, unknown>) ?? {};
  const scope = J(p.scope), design = J(p.design), mat = J(p.materials), impl = J(p.implementation), infra = J(p.infrastructure);
  return (
    <>
      <PageHeader title={p.name} crumbs={[{ label: "Evaluation Plans", href: "/plans" }, { label: p.name }]} description={`${p.system.code} · ${p.system.name}`} actions={<>
        <Link href={`/evaluations/new?systemId=${p.systemId}&planId=${p.id}`}><Button>Run this plan</Button></Link>
        <Link href={`/reports/new?systemId=${p.systemId}&type=NIST_ARIA_EVALUATION_REPORT&planId=${p.id}`}><Button variant="outline">ARIA report</Button></Link>
        {p.status !== "COMPLETED" && <form action={setPlanStatusAction.bind(null, p.id, "COMPLETED")}><Button variant="ghost" type="submit">Mark completed</Button></form>}
      </>} />
      <div className="mb-4"><Badge tone={toneForStatus(p.status)}>{enumLabel(p.status)}</Badge></div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>B.1 Scope</CardTitle></CardHeader><CardContent><KV items={[["AI application(s)", scope.applications], ["Sector", scope.sector], ["Use cases", scope.useCases], ["Target concept", scope.targetConcept]]} /></CardContent></Card>
        <Card><CardHeader><CardTitle>B.2 Design</CardTitle></CardHeader><CardContent><KV items={[["Model Testing goal", design.modelTestingGoal], ["Red Teaming goal", design.redTeamingGoal], ["User Testing goal", design.userTestingGoal], ["Tester distribution", design.testerDistribution]]} /></CardContent></Card>
        <Card className="lg:col-span-2"><CardHeader><CardTitle>B.3 Materials — scenarios ({p.scenarios.length})</CardTitle><CardDescription>{str(mat.redTeamingInstructions)}</CardDescription></CardHeader><CardContent className="px-0 pb-0"><Table><THead><TR><TH>Scenario</TH><TH>Testing type</TH><TH>Category</TH><TH>Target concept</TH><TH>Prompts</TH><TH>Annotation items</TH></TR></THead><TBody>{p.scenarios.map((ps) => <TR key={ps.scenarioId}><TD><Link href={`/library/${ps.scenario.method.code}?scenario=${ps.scenario.code}`} className="hover:underline"><span className="font-mono text-xs text-muted">{ps.scenario.code}</span> {ps.scenario.name}</Link></TD><TD><Badge tone={ps.testingType === "RED_TEAMING" ? "danger" : ps.testingType === "USER_TESTING" ? "accent" : "info"}>{enumLabel(ps.testingType)}</Badge></TD><TD><Badge>{enumLabel(ps.scenario.method.category)}</Badge></TD><TD className="text-xs">{ps.scenario.targetConcept}</TD><TD className="tabular-nums">{(ps.scenario.prompts as unknown[]).length}</TD><TD className="tabular-nums">{(ps.scenario.annotationSchema as unknown[]).length}</TD></TR>)}</TBody></Table></CardContent></Card>
        <Card><CardHeader><CardTitle>B.4 Infrastructure</CardTitle></CardHeader><CardContent><KV items={[["Testing platform", infra.platform], ["Annotation tool", infra.annotationTool], ["Scoring tool", infra.scoringTool], ["Evaluation API", infra.evaluationApi], ["Data schema", "SessionID · Date/Time · TesterID · ApplicationID · ScenarioID · TestingType · Dialogues · Questionnaires · Annotations"]]} /></CardContent></Card>
        <Card><CardHeader><CardTitle>B.5 Implementation</CardTitle></CardHeader><CardContent><KV items={[["Red teamers", impl.redTeamers], ["User testers", impl.userTesters], ["Annotators", impl.annotators], ["Data collection", impl.dataCollection], ["Data analysis", impl.dataAnalysis], ["Reported results", impl.reportedResults]]} /></CardContent></Card>
        <Card className="lg:col-span-2"><CardHeader><CardTitle>Runs ({p.runs.length})</CardTitle></CardHeader><CardContent className="px-0 pb-0">{p.runs.length ? <Table><THead><TR><TH>Run</TH><TH>Mode</TH><TH>Status</TH><TH>Verdict</TH><TH>Score</TH><TH>When</TH></TR></THead><TBody>{p.runs.map((r) => <TR key={r.id}><TD><Link href={`/evaluations/${r.id}`} className="hover:underline"><span className="font-mono text-xs text-muted">{r.code}</span> {r.name}</Link></TD><TD><Badge tone={r.mode === "LIVE" ? "accent" : "warning"}>{r.mode}</Badge></TD><TD><Badge tone={toneForStatus(r.status)}>{enumLabel(r.status)}</Badge></TD><TD><VerdictBadge verdict={r.verdict} /></TD><TD className="tabular-nums">{(r.summary as { assuranceScore?: number }).assuranceScore ?? "—"}</TD><TD className="text-xs text-muted">{fmtAgo(r.createdAt)}</TD></TR>)}</TBody></Table> : <p className="px-5 pb-5 text-sm text-muted">No runs yet.</p>}</CardContent></Card>
      </div>
    </>
  );
}
