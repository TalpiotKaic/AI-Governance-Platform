import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { enumLabel } from "@/lib/utils";
import { createPlanAction } from "../actions";

export default async function NewPlanPage(props: PageProps<"/plans/new">) {
  const user = await requireUser();
  const sp = await props.searchParams;
  const systems = await db.aiSystem.findMany({ where: { orgId: user.orgId }, orderBy: { code: "asc" } });
  const scenarios = await db.testScenario.findMany({ orderBy: { code: "asc" }, include: { method: true } });
  const systemId = typeof sp.systemId === "string" ? sp.systemId : systems[0]?.id;
  const sys = systems.find((s) => s.id === systemId);
  const groups = ["MODEL_TESTING", "RED_TEAMING", "USER_TESTING"] as const;
  return (
    <>
      <PageHeader title="New evaluation plan" crumbs={[{ label: "Evaluation Plans", href: "/plans" }, { label: "New" }]} description="Fill the NIST AI 200-3 worksheets. Scenario applicability is highlighted for the selected system type." />
      <form action={createPlanAction} className="space-y-4">
        <Card><CardHeader><CardTitle>B.1 Scope</CardTitle></CardHeader><CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="AI system"><Select name="systemId" defaultValue={systemId} required>{systems.map((s) => <option key={s.id} value={s.id}>{s.code} · {s.name} ({enumLabel(s.type)})</option>)}</Select></Field>
          <Field label="Plan name"><Input name="name" required defaultValue={sys ? `${sys.name} — ${sys.sector ?? "Sector"} evaluation` : ""} /></Field>
          <Field label="AI application(s) being evaluated (one per line)"><Textarea name="applications" defaultValue={sys ? `${sys.code} ${sys.name}` : ""} /></Field>
          <Field label="Sector"><Input name="sector" defaultValue={sys?.sector ?? ""} /></Field>
          <Field label="Intended use cases (one per line)" className="md:col-span-2"><Textarea name="useCases" /></Field>
          <Field label="Target concept (what you want to measure)" className="md:col-span-2" hint="Align with a NIST trustworthiness characteristic, e.g. “Privacy-Enhanced — the degree to which the application does not disclose PHI…”"><Textarea name="targetConcept" required /></Field>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>B.2 Design</CardTitle></CardHeader><CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Goal of Model Testing"><Textarea name="modelTestingGoal" /></Field><Field label="Goal of Red Teaming"><Textarea name="redTeamingGoal" /></Field><Field label="Goal of User Testing"><Textarea name="userTestingGoal" /></Field>
          <Field label="Distribution of testers"><Select name="testerDistribution" defaultValue="Mixed"><option>Within-subjects: testers interact with multiple applications in multiple scenarios</option><option>Between-subjects: testers interact with a single application in a single scenario</option><option>Mixed</option></Select></Field>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>B.3 Materials — scenarios</CardTitle><CardDescription>Select scenarios from the library. Highlighted rows are applicable to the selected system type.</CardDescription></CardHeader><CardContent className="space-y-4">
          {groups.map((g) => <div key={g}><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{enumLabel(g)}</p><div className="grid grid-cols-1 gap-1 md:grid-cols-2">{scenarios.filter((s) => s.method.testingType === g).map((s) => { const applicable = sys ? s.applicableTo.includes(sys.type) : true; return <label key={s.id} className={`flex items-start gap-2 rounded-md border px-2 py-1.5 text-sm ${applicable ? "border-border" : "border-dashed border-border opacity-60"}`}><input type="checkbox" name="scenarioIds" value={s.id} defaultChecked={applicable} className="mt-1 accent-[var(--primary)]" /><span><span className="font-mono text-xs text-muted">{s.code}</span> {s.name} <Badge>{enumLabel(s.method.category)}</Badge><span className="block text-[11px] text-muted">{(s.prompts as unknown[]).length} prompts · {s.targetConcept}</span></span></label>; })}</div></div>)}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="Components captured by Model Testing prompts"><Input name="modelTestingComponents" /></Field><Field label="Components captured by annotation schema"><Input name="annotationComponents" /></Field><Field label="Red Teaming instructions"><Textarea name="redTeamingInstructions" defaultValue="Attempt to obtain data or actions you are not authorised for. Use identity spoofing, authority claims, multi-step trust building and poisoned content. Vary your tactics and be creative." /></Field><Field label="User Testing instructions"><Textarea name="userTestingInstructions" defaultValue="Imagine you are a user of the application for the scenario described. Afterwards answer the questionnaire." /></Field></div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>B.4 Infrastructure & B.5 Implementation</CardTitle></CardHeader><CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Annotation tool"><Input name="annotationTool" defaultValue="rule-based + LLM-as-judge with 20% human-validated sample" /></Field><Field label="Evaluation API / target adapter"><Input name="evaluationApi" defaultValue="Anthropic / OpenAI-compatible / HTTP Evaluation API / demo" /></Field>
          <Field label="Red teamers — sampling frame, eligibility, sample size"><Textarea name="redTeamers" /></Field><Field label="User testers — sampling frame, eligibility, sample size"><Textarea name="userTesters" /></Field><Field label="Annotators — sampling frame, expertise, sample size"><Textarea name="annotators" /></Field><Field label="Data collection (IRB, consent, storage, risk mitigation)"><Textarea name="dataCollection" /></Field><Field label="Data analysis techniques"><Textarea name="dataAnalysis" defaultValue="Severity-weighted violation rates; between-scenario comparison; measurement-tree aggregation into the AI Assurance Score." /></Field><Field label="What reported results will tell"><Textarea name="reportedResults" /></Field>
          <div className="md:col-span-2"><Checkbox name="ack" label="Human testing phases (red teaming / user testing with people) will undergo IRB/consent review before data collection." defaultChecked /></div>
        </CardContent></Card>
        <div className="flex justify-end"><Button type="submit">Create plan</Button></div>
      </form>
    </>
  );
}
