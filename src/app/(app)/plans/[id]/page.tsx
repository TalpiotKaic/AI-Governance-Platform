import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser, userCan } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, toneForStatus } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { VerdictBadge } from "@/components/domain/verdict";
import { fmtAgo} from "@/lib/utils";
import { setPlanStatusAction } from "../actions";
import { getI18n } from "@/lib/i18n/server";
import { localizeScenario } from "@/lib/i18n/library";

const str = (v: unknown) => (Array.isArray(v) ? v.join("; ") : v ? String(v) : "—");
function KV({ items }: { items: [string, unknown][] }) {
  return <dl className="grid grid-cols-1 gap-2 text-sm">{items.map(([k, v]) => <div key={k} className="border-b border-border/60 pb-1.5"><dt className="text-[11px] font-medium uppercase tracking-wide text-muted">{k}</dt><dd className="whitespace-pre-wrap">{str(v)}</dd></div>)}</dl>;
}

export default async function PlanPage(props: PageProps<"/plans/[id]">) {
  const { locale, t, L } = await getI18n();
  const user = await requireUser();
  const { id } = await props.params;
  const p = await db.evaluationPlan.findFirst({ where: { id, orgId: user.orgId }, include: { system: true, scenarios: { include: { scenario: { include: { method: true } } } }, runs: { orderBy: { createdAt: "desc" } } } });
  if (!p) notFound();
  const J = (v: unknown) => (v as Record<string, unknown>) ?? {};
  const scope = J(p.scope), design = J(p.design), mat = J(p.materials), impl = J(p.implementation), infra = J(p.infrastructure);
  return (
    <>
      <PageHeader title={p.name} crumbs={[{ label: "Evaluation Plans", href: "/plans" }, { label: p.name }]} description={`${p.system.code} · ${p.system.name}`} actions={<>
        {userCan(user, "evaluations.run") && <Link href={`/evaluations/new?systemId=${p.systemId}&planId=${p.id}`}><Button>{t("Run this plan")}</Button></Link>}
        {userCan(user, "reports.generate") && <Link href={`/reports/new?systemId=${p.systemId}&type=NIST_ARIA_EVALUATION_REPORT&planId=${p.id}`}><Button variant="outline">{t("ARIA report")}</Button></Link>}
        {p.status !== "COMPLETED" && userCan(user, "plans.write") && <form action={setPlanStatusAction.bind(null, p.id, "COMPLETED")}><Button variant="ghost" type="submit">{t("Mark completed")}</Button></form>}
      </>} />
      <div className="mb-4"><Badge tone={toneForStatus(p.status)}>{L(p.status)}</Badge></div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>{t("B.1 Scope")}</CardTitle></CardHeader><CardContent><KV items={[[t("AI application(s)"), scope.applications], [t("Sector"), scope.sector], [t("Use cases"), scope.useCases], [t("Target concept"), scope.targetConcept]]} /></CardContent></Card>
        <Card><CardHeader><CardTitle>{t("B.2 Design")}</CardTitle></CardHeader><CardContent><KV items={[[t("Model Testing goal"), design.modelTestingGoal], [t("Red Teaming goal"), design.redTeamingGoal], [t("User Testing goal"), design.userTestingGoal], [t("Tester distribution"), design.testerDistribution]]} /></CardContent></Card>
        <Card className="lg:col-span-2"><CardHeader><CardTitle>{t("B.3 Materials — scenarios")} ({p.scenarios.length})</CardTitle><CardDescription>{str(mat.redTeamingInstructions)}</CardDescription></CardHeader><CardContent className="px-0 pb-0"><Table><THead><TR><TH>{t("Scenario")}</TH><TH>{t("Testing type")}</TH><TH>{t("Category")}</TH><TH>{t("Target concept")}</TH><TH>{t("Prompts")}</TH><TH>{t("Annotation items")}</TH></TR></THead><TBody>{p.scenarios.map((ps) => { const sc = localizeScenario(locale, ps.scenario); return <TR key={ps.scenarioId}><TD><Link href={`/library/${ps.scenario.method.code}?scenario=${ps.scenario.code}`} className="hover:underline"><span className="font-mono text-xs text-muted">{sc.code}</span> {sc.name}</Link></TD><TD><Badge tone={ps.testingType === "RED_TEAMING" ? "danger" : ps.testingType === "USER_TESTING" ? "accent" : "info"}>{L(ps.testingType)}</Badge></TD><TD><Badge>{L(ps.scenario.method.category)}</Badge></TD><TD className="text-xs">{sc.targetConcept}</TD><TD className="tabular-nums">{(ps.scenario.prompts as unknown[]).length}</TD><TD className="tabular-nums">{(ps.scenario.annotationSchema as unknown[]).length}</TD></TR>; })}</TBody></Table></CardContent></Card>
        <Card><CardHeader><CardTitle>{t("B.4 Infrastructure")}</CardTitle></CardHeader><CardContent><KV items={[[t("Testing platform"), infra.platform], [t("Annotation tool"), infra.annotationTool], [t("Scoring tool"), infra.scoringTool], [t("Evaluation API"), infra.evaluationApi], [t("Data schema"), "SessionID · Date/Time · TesterID · ApplicationID · ScenarioID · TestingType · Dialogues · Questionnaires · Annotations"]]} /></CardContent></Card>
        <Card><CardHeader><CardTitle>{t("B.5 Implementation")}</CardTitle></CardHeader><CardContent><KV items={[[t("Red teamers"), impl.redTeamers], [t("User testers"), impl.userTesters], [t("Annotators"), impl.annotators], [t("Data collection"), impl.dataCollection], [t("Data analysis"), impl.dataAnalysis], [t("Reported results"), impl.reportedResults]]} /></CardContent></Card>
        <Card className="lg:col-span-2"><CardHeader><CardTitle>{t("Runs")} ({p.runs.length})</CardTitle></CardHeader><CardContent className="px-0 pb-0">{p.runs.length ? <Table><THead><TR><TH>{t("Run")}</TH><TH>{t("Mode")}</TH><TH>{t("Status")}</TH><TH>{t("Verdict")}</TH><TH>{t("Score")}</TH><TH>{t("When")}</TH></TR></THead><TBody>{p.runs.map((r) => <TR key={r.id}><TD><Link href={`/evaluations/${r.id}`} className="hover:underline"><span className="font-mono text-xs text-muted">{r.code}</span> {r.name}</Link></TD><TD><Badge tone={r.mode === "LIVE" ? "accent" : "warning"}>{r.mode}</Badge></TD><TD><Badge tone={toneForStatus(r.status)}>{L(r.status)}</Badge></TD><TD><VerdictBadge verdict={r.verdict} /></TD><TD className="tabular-nums">{(r.summary as { assuranceScore?: number }).assuranceScore ?? "—"}</TD><TD className="text-xs text-muted">{fmtAgo(r.createdAt)}</TD></TR>)}</TBody></Table> : <p className="px-5 pb-5 text-sm text-muted">{t("No runs yet.")}</p>}</CardContent></Card>
      </div>
    </>
  );
}
