import { db } from "@/lib/db";
import { fmtDate, num, pct } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/dict";
import { localizeControl, localizeFramework, localizeRequirement } from "@/lib/i18n/content";
import { localizeMethod, localizeMetricName, localizeScenario } from "@/lib/i18n/library";
import { labelFor } from "@/lib/i18n/labels";
import { localizeRiskTitle } from "@/lib/i18n/risks";
import { rt } from "./dict";
import { evidenceCountsFor, validEvidenceWhere } from "@/lib/documents";
import type { Block, ReportContent, Section } from "./types";
import type { FrameworkCode, ReportType } from "@/generated/prisma/client";

type Metric = { key: string; name: string; category: string; value: number; threshold: number; direction: string; verdict: string; sampleSize?: number; unit?: string };
type Summary = { verdict?: string; assuranceScore?: number; byCategory?: Record<string, number>; counts?: Record<string, number>; metrics?: Metric[]; target?: string; judge?: string; scenarios?: { code: string; name: string; category: string; testingType: string }[] };

type DbMetric = { metricKey: string; name: string; category: string; value: number; threshold: number | null; direction: string; verdict: string; sampleSize: number | null; unit: string | null };
function toMetric(m: DbMetric): Metric {
  return { key: m.metricKey, name: m.name, category: m.category, value: m.value, threshold: m.threshold ?? 0, direction: m.direction, verdict: m.verdict, sampleSize: m.sampleSize ?? undefined, unit: m.unit ?? undefined };
}
function fmtMetric(m: Metric) {
  if (m.unit === "ms") return `${Math.round(m.value)} ms`;
  if (m.unit === "score") return num(m.value, 2);
  return pct(m.value, 1);
}
function fmtThreshold(m: Metric) {
  const op = m.direction === "lower" ? "≤" : "≥";
  if (m.unit === "ms") return `${op} ${m.threshold} ms`;
  if (m.unit === "score") return `${op} ${m.threshold}`;
  return `${op} ${pct(m.threshold, 0)}`;
}

const DEMO_DISCLAIMER = "This run was executed in DEMO mode against a simulated target with deterministic synthetic responses. Results illustrate the platform's evaluation, scoring and evidence workflow and must not be used as evidence about any real AI system.";
const LIVE_DISCLAIMER = "Annotations were produced by rule-based checks and an LLM-as-judge (NIST AI 200-3 §6). LLM-as-judge annotations should be validated on a human-reviewed sample before the results are relied upon for conformity decisions.";

function i18n(locale: Locale) {
  return { tr: (k: string) => rt(locale, k), L: (v: string | null | undefined) => labelFor(locale, v) };
}

async function loadSystem(systemId: string) {
  return db.aiSystem.findUniqueOrThrow({
    where: { id: systemId },
    include: { org: true, owner: true, technicalOwner: true, models: true, agentProfile: true, datasets: { include: { dataset: true } }, vendors: { include: { vendor: true } }, risks: { orderBy: { score: "desc" } }, changeEvents: { orderBy: { createdAt: "desc" } } },
  });
}

function systemSection(s: Awaited<ReturnType<typeof loadSystem>>, locale: Locale): Section {
  const { tr, L } = i18n(locale);
  const items = [
    { label: tr("System"), value: `${s.code} · ${s.name}` },
    { label: tr("Type"), value: L(s.type) },
    { label: tr("Sector"), value: s.sector ?? "—" },
    { label: tr("Purpose"), value: s.purpose ?? "—" },
    { label: tr("Lifecycle stage"), value: L(s.lifecycleStage) },
    { label: tr("Risk tier"), value: L(s.riskTier) },
    { label: tr("EU AI Act classification"), value: L(s.euAiActCategory) + (s.euAiActAnnexIIIArea ? ` (${s.euAiActAnnexIIIArea})` : "") },
    { label: tr("Owner"), value: s.owner?.name ?? "—" },
    { label: tr("Technical owner"), value: s.technicalOwner?.name ?? "—" },
    { label: tr("Models"), value: s.models.map((m) => `${m.provider} ${m.name}${m.version ? ` v${m.version}` : ""}`).join("; ") || "—" },
    { label: tr("Personal data"), value: s.usesPersonalData ? (s.usesSensitiveData ? tr("Yes (incl. sensitive)") : tr("Yes")) : tr("No") },
    { label: tr("Human oversight"), value: s.humanOversight ?? "—" },
  ];
  const blocks: Block[] = [{ type: "kv", items }];
  if (s.agentProfile) {
    const tools = (s.agentProfile.tools as { name: string; riskLevel?: string; allowed?: boolean; permissions?: string[] }[]) ?? [];
    blocks.push({ type: "paragraph", text: `${tr("Agent profile — framework:")} ${s.agentProfile.framework ?? tr("n/a")}, ${tr("autonomy:")} ${L(s.agentProfile.autonomyLevel)}, ${tr("kill switch:")} ${s.agentProfile.killSwitch ? tr("yes") : tr("no")}${s.agentProfile.maxBudgetUsd ? `, ${tr("budget cap")} $${s.agentProfile.maxBudgetUsd}` : ""}.` });
    blocks.push({ type: "table", columns: [tr("Tool"), tr("Risk level"), tr("Allowed"), tr("Permissions")], rows: tools.map((t) => [t.name, t.riskLevel ?? "—", t.allowed === false ? tr("No") : tr("Yes"), (t.permissions ?? []).join(", ") || "—"]), badgeColumns: [1, 2] });
  }
  return { id: "system", title: tr("System under evaluation"), blocks };
}

export async function buildEvaluationReport(runId: string, locale: Locale = "en"): Promise<ReportContent> {
  const { tr, L } = i18n(locale);
  const run = await db.evaluationRun.findUniqueOrThrow({ where: { id: runId }, include: { system: { include: { org: true } }, plan: true, metrics: true, findings: { orderBy: { severity: "desc" } }, sessions: { include: { scenario: { include: { method: true } }, annotations: true } } } });
  const s = await loadSystem(run.systemId);
  const summary = run.summary as Summary;
  const env = run.environment as Record<string, unknown>;
  const byType = new Map<string, number>();
  for (const ss of run.sessions) byType.set(ss.testingType, (byType.get(ss.testingType) ?? 0) + 1);
  const scenarioRows = (summary.scenarios ?? []).map((sc) => [sc.code, sc.name, L(sc.category), L(sc.testingType), String(run.sessions.filter((x) => x.scenario.code === sc.code).length), String(run.sessions.filter((x) => x.scenario.code === sc.code && x.verdict === "FAIL").length)]);
  const sections: Section[] = [
    { id: "summary", title: tr("Executive summary"), blocks: [
      { type: "score", label: tr("AI Assurance Score"), value: summary.assuranceScore ?? null, verdict: summary.verdict ?? run.verdict },
      { type: "kv", items: [
        { label: tr("Run"), value: `${run.code} · ${run.name}` },
        { label: tr("Mode"), value: run.mode },
        { label: tr("Target"), value: summary.target ?? String(env.target ?? "—") },
        { label: tr("Judge"), value: summary.judge ?? "—" },
        { label: tr("Executed"), value: `${fmtDate(run.startedAt, true)} → ${fmtDate(run.finishedAt, true)}` },
        { label: tr("Sessions"), value: `${summary.counts?.sessions ?? run.sessions.length} (${tr("pass")} ${summary.counts?.passed ?? 0}, ${tr("fail")} ${summary.counts?.failed ?? 0})` },
        { label: tr("Findings"), value: `${run.findings.length} (${tr("critical")} ${run.findings.filter((f) => f.severity === "CRITICAL").length}, ${tr("high")} ${run.findings.filter((f) => f.severity === "HIGH").length})` },
      ] },
      { type: "paragraph", text: summary.verdict === "PASS" ? tr("All evaluated metrics met their acceptance thresholds. The system is recommended for approval for the evaluated scope, subject to continuous monitoring and re-test on change.") : summary.verdict === "WARN" ? tr("One or more metrics are within the warning band. Remediation is recommended before deployment approval; see findings.") : tr("One or more acceptance thresholds were not met or critical findings were raised. Deployment approval should be withheld until findings are mitigated and the affected scenarios are re-run."), tone: summary.verdict === "PASS" ? "success" : summary.verdict === "WARN" ? "warning" : "danger" },
      { type: "callout", title: run.mode === "DEMO" ? "Demo mode" : tr("Methodological note"), text: run.mode === "DEMO" ? tr(DEMO_DISCLAIMER) : tr(LIVE_DISCLAIMER), tone: run.mode === "DEMO" ? "warning" : "info" },
    ] },
    systemSection(s, locale),
    { id: "method", title: tr("Methodology (NIST AI 200-3 ARIA-style)"), blocks: [
      { type: "paragraph", text: `${tr("The evaluation combined")} ${[...byType.keys()].map((k) => L(k)).join(", ")} ${tr("sessions.")} ${tr("Each session is a tester–application interaction identified by SessionID with TesterID, ApplicationID, ScenarioID and TestingType; dialogues, tool calls and annotations were logged per the ARIA data schema.")} ${tr("Annotation used rule-based checks plus")} ${run.mode === "DEMO" ? tr("a simulated judge over ground-truth tags") : tr("an LLM-as-judge with structured rationale and confidence")}. ${tr("Metrics aggregate annotation items per test method and are compared against pre-registered acceptance thresholds.")}` },
      { type: "table", columns: [tr("Scenario"), tr("Name"), tr("Category"), tr("Testing type"), tr("Sessions"), tr("Failed")], rows: scenarioRows, badgeColumns: [2, 3] },
      { type: "kv", items: Object.entries(env).map(([k, v]) => ({ label: k, value: v === null ? "—" : String(v) })) },
    ] },
    { id: "results", title: tr("Results by metric"), blocks: [
      { type: "metrics", items: run.metrics.map((m) => { const mm = toMetric(m); return { name: localizeMetricName(locale, m.metricKey, m.name), value: fmtMetric(mm), threshold: fmtThreshold(mm), verdict: m.verdict, category: L(m.category), sampleSize: m.sampleSize ?? undefined }; }) },
      { type: "table", columns: [tr("Category"), tr("Category score")], rows: Object.entries(summary.byCategory ?? {}).map(([k, v]) => [L(k), `${v}/100`]) },
    ] },
    { id: "findings", title: tr("Findings"), blocks: run.findings.length ? [{ type: "findings", items: run.findings.map((f) => ({ code: f.code, title: f.title, severity: f.severity, category: L(f.category), excerpt: f.evidenceExcerpt ?? undefined, recommendation: f.recommendation ?? undefined, status: f.status })) }] : [{ type: "paragraph", text: tr("No findings were raised."), tone: "success" }] },
    { id: "traceability", title: tr("Traceability: controls verified by this run"), blocks: await traceabilityBlocks(run.sessions.map((x) => x.scenario.method.id), run.systemId, locale) },
    { id: "limitations", title: tr("Limitations"), blocks: [{ type: "list", items: [
      tr("Results apply to the evaluated scenarios, prompt sets and configuration only; generalisation to other contexts of use is limited (NIST AI 200-3 §7)."),
      tr("Automated red teaming complements but does not replace human red teaming; dynamic human adversaries may find failure modes not covered here."),
      run.mode === "DEMO" ? tr(DEMO_DISCLAIMER) : tr(LLM_JUDGE_LIMIT),
      tr("Any change to model version, prompts, tools or data sources invalidates these results until the affected categories are re-tested (change-triggered re-evaluation)."),
    ] }] },
  ];
  return { meta: { reportType: "EVALUATION_REPORT", language: locale, generatedAt: new Date().toISOString(), systemName: s.name, systemCode: s.code, organization: s.org.name, runCodes: [run.code], mode: run.mode, disclaimer: run.mode === "DEMO" ? tr(DEMO_DISCLAIMER) : undefined }, sections };
}
const LLM_JUDGE_LIMIT = "LLM-as-judge annotations carry model-dependent variance; multiple judge runs and human validation of a sample are recommended before relying on borderline results.";

async function traceabilityBlocks(methodIds: string[], systemId: string, locale: Locale): Promise<Block[]> {
  const { tr, L } = i18n(locale);
  const methods = await db.testMethod.findMany({ where: { id: { in: [...new Set(methodIds)] } }, include: { controls: { include: { control: { include: { requirements: { include: { requirement: { include: { framework: true } } } }, impls: { where: { systemId } } } } } } } });
  const rows: (string | null)[][] = [];
  for (const m of methods) for (const cm of m.controls) {
    const c = cm.control;
    const refs = c.requirements.map((rc) => `${L(rc.requirement.framework.code)} ${rc.requirement.ref}`).slice(0, 8).join("; ");
    rows.push([m.code, localizeMethod(locale, m).name, c.code, localizeControl(locale, c).name, c.impls[0]?.status ?? "NOT_STARTED", refs]);
  }
  return [{ type: "paragraph", text: tr("Each test method is mapped to harmonized controls, which in turn map to framework requirements. Passing metrics mark the control as VERIFIED for this system and attach generated evidence.") }, { type: "table", columns: [tr("Method"), tr("Test method"), tr("Control"), tr("Harmonized control"), tr("Status"), tr("Requirements")], rows, badgeColumns: [4] }];
}

export async function buildVerificationReport(runIds: string[], opts: { tester?: string; reviewer?: string; approver?: string } = {}, locale: Locale = "en"): Promise<ReportContent> {
  const { tr, L } = i18n(locale);
  const runs = await db.evaluationRun.findMany({ where: { id: { in: runIds } }, include: { metrics: true, findings: true, sessions: { include: { scenario: { include: { method: true } } } } }, orderBy: { createdAt: "asc" } });
  if (!runs.length) throw new Error("No runs");
  const s = await loadSystem(runs[0].systemId);
  const methodsUsed = new Map<string, { code: string; name: string; standardRef: string | null; category: string }>();
  for (const r of runs) for (const ss of r.sessions) methodsUsed.set(ss.scenario.method.id, { code: ss.scenario.method.code, name: localizeMethod(locale, ss.scenario.method).name, standardRef: ss.scenario.method.standardRef, category: ss.scenario.method.category });
  const metricRows = runs.flatMap((r) => r.metrics.map((m) => {
    const method = [...methodsUsed.values()].find((x) => x.category === m.category);
    const mm = toMetric(m);
    return [method?.code ?? "—", localizeMetricName(locale, m.metricKey, m.name), method?.standardRef ?? "—", fmtThreshold(mm), fmtMetric(mm), String(m.sampleSize ?? "—"), m.verdict];
  }));
  const overall = runs.every((r) => r.verdict === "PASS") ? "PASS" : runs.some((r) => r.verdict === "FAIL") ? "FAIL" : "WARN";
  const anyDemo = runs.some((r) => r.mode === "DEMO");
  const sections: Section[] = [
    { id: "id", title: tr("Report identification"), blocks: [{ type: "kv", items: [
      { label: tr("Report type"), value: tr("AI System Verification Report (test report)") },
      { label: tr("Organization"), value: s.org.name },
      { label: tr("Evaluation run(s)"), value: runs.map((r) => r.code).join(", ") },
      { label: tr("Test period"), value: `${fmtDate(runs[0].startedAt, true)} → ${fmtDate(runs[runs.length - 1].finishedAt, true)}` },
      { label: tr("Test mode"), value: runs.map((r) => r.mode).join(", ") },
      { label: tr("Overall judgement"), value: overall },
    ] }, ...(anyDemo ? [{ type: "callout", title: tr("Demo mode"), text: tr(DEMO_DISCLAIMER), tone: "warning" } as Block] : [])] },
    systemSection(s, locale),
    { id: "items", title: tr("Test items, methods and acceptance criteria"), blocks: [
      { type: "table", columns: [tr("Method"), tr("Test method"), tr("Reference standard / guidance"), tr("Category")], rows: [...methodsUsed.values()].map((m) => [m.code, m.name, m.standardRef ?? "—", L(m.category)]), badgeColumns: [3] },
    ] },
    { id: "results", title: tr("Test results"), blocks: [
      { type: "table", columns: [tr("Method"), tr("Metric"), tr("Reference"), tr("Acceptance criterion"), tr("Measured"), tr("n"), tr("Verdict")], rows: metricRows, badgeColumns: [6] },
      { type: "score", label: tr("Overall judgement"), value: null, verdict: overall },
    ] },
    { id: "conditions", title: tr("Test conditions & environment"), blocks: runs.map((r) => ({ type: "kv", items: [{ label: tr("Run"), value: r.code }, ...Object.entries(r.environment as Record<string, unknown>).map(([k, v]) => ({ label: k, value: v === null ? "—" : String(v) }))] }) as Block) },
    { id: "nonconformities", title: tr("Nonconformities and observations"), blocks: runs.flatMap((r) => r.findings).length ? [{ type: "findings", items: runs.flatMap((r) => r.findings).map((f) => ({ code: f.code, title: f.title, severity: f.severity, category: L(f.category), excerpt: f.evidenceExcerpt ?? undefined, recommendation: f.recommendation ?? undefined, status: f.status })) }] : [{ type: "paragraph", text: tr("No nonconformities observed."), tone: "success" }] },
    { id: "deviations", title: tr("Deviations, limitations and statement"), blocks: [
      { type: "list", items: [tr("Results relate only to the items tested under the stated conditions."), tr("This report shall not be reproduced except in full without written approval of the issuing body."), anyDemo ? tr(DEMO_DISCLAIMER) : tr(LLM_JUDGE_LIMIT), tr("Re-testing is required after any substantial modification (model version, prompt, tool, data source) per the change-impact policy.")] },
    ] },
    { id: "signatures", title: tr("Tester / Reviewer / Approver"), blocks: [{ type: "signatures", roles: [{ role: tr("Tester"), name: opts.tester ?? "", date: "" }, { role: tr("Technical reviewer"), name: opts.reviewer ?? "", date: "" }, { role: tr("Authorised approver"), name: opts.approver ?? "", date: "" }] }] },
  ];
  return { meta: { reportType: "VERIFICATION_REPORT", language: locale, generatedAt: new Date().toISOString(), systemName: s.name, systemCode: s.code, organization: s.org.name, runCodes: runs.map((r) => r.code), mode: runs.map((r) => r.mode).join("/"), disclaimer: anyDemo ? tr(DEMO_DISCLAIMER) : undefined }, sections };
}

export async function buildAriaReport(planId: string, locale: Locale = "en"): Promise<ReportContent> {
  const { tr, L } = i18n(locale);
  const plan = await db.evaluationPlan.findUniqueOrThrow({ where: { id: planId }, include: { system: { include: { org: true } }, scenarios: { include: { scenario: { include: { method: true } } } }, runs: { include: { metrics: true, findings: true, sessions: true }, orderBy: { createdAt: "desc" } } } });
  const s = await loadSystem(plan.systemId);
  const scope = plan.scope as Record<string, unknown>;
  const design = plan.design as Record<string, unknown>;
  const materials = plan.materials as Record<string, unknown>;
  const infra = plan.infrastructure as Record<string, unknown>;
  const impl = plan.implementation as Record<string, unknown>;
  const str = (v: unknown) => (Array.isArray(v) ? v.map(String).join("; ") : v === undefined || v === null || v === "" ? "—" : String(v));
  const lastRun = plan.runs[0];
  const sections: Section[] = [
    { id: "b1", title: tr("B.1 Scope"), blocks: [{ type: "kv", items: [
      { label: tr("AI application(s) being evaluated"), value: str(scope.applications) || `${s.code} ${s.name}` },
      { label: tr("Sector"), value: str(scope.sector ?? s.sector) },
      { label: tr("Intended use cases"), value: str(scope.useCases) },
      { label: tr("Target concept"), value: str(scope.targetConcept) },
    ] }] },
    { id: "b2", title: tr("B.2 Design"), blocks: [{ type: "kv", items: [
      { label: tr("Goal of Model Testing"), value: str(design.modelTestingGoal) },
      { label: tr("Goal of Red Teaming"), value: str(design.redTeamingGoal) },
      { label: tr("Goal of User Testing"), value: str(design.userTestingGoal) },
      { label: tr("Distribution of testers"), value: str(design.testerDistribution) },
    ] }] },
    { id: "b3", title: tr("B.3 Materials"), blocks: [
      { type: "kv", items: [{ label: tr("Scenarios"), value: plan.scenarios.map((ps) => `${ps.scenario.code} ${localizeScenario(locale, ps.scenario).name}`).join("; ") || "—" }, { label: tr("Components captured by Model Testing prompts"), value: str(materials.modelTestingComponents) }, { label: tr("Red Teaming instructions"), value: str(materials.redTeamingInstructions) }, { label: tr("User Testing instructions"), value: str(materials.userTestingInstructions) }, { label: tr("Annotation schema components"), value: str(materials.annotationComponents) }] },
      { type: "table", columns: [tr("Scenario"), tr("Testing type"), tr("Prompts / sample"), tr("Annotation items"), tr("Questionnaire items")], rows: plan.scenarios.map((ps) => [ps.scenario.code, L(ps.testingType), String(ps.sampleSize ?? (ps.scenario.prompts as unknown[]).length), String((ps.scenario.annotationSchema as unknown[]).length), String((ps.scenario.questionnaire as unknown[]).length)]), badgeColumns: [1] },
    ] },
    { id: "b4", title: tr("B.4 Infrastructure"), blocks: [{ type: "list", items: [
      `${tr("Testing platform: K-VeriAI evaluation engine — prompt delivery, dialogue collection, tester assignment, instruction display, questionnaire administration")} (${str(infra.platform ?? tr("all components"))})`,
      tr("Data schema: SessionID, Date/Time, TesterID, ApplicationID, ScenarioID, TestingType; Dialogues, Questionnaires, Annotations (implemented as TestSession / DialogueTurn / QuestionnaireResponse / Annotation)."),
      `${tr("Annotation tool: rule-based checks +")} ${str(infra.annotationTool ?? tr("LLM-as-judge with human validation sample"))}.`,
      `${tr("Scoring tool: metric aggregation per test method, severity weighting, category scores and AI Assurance Score")} (${str(infra.scoringTool ?? tr("built-in"))}).`,
      `${tr("Evaluation API:")} ${str(infra.evaluationApi ?? tr("adapter (Anthropic / OpenAI-compatible / HTTP Evaluation API / demo)"))}.`,
    ] }] },
    { id: "b5", title: tr("B.5 Implementation"), blocks: [{ type: "kv", items: [
      { label: tr("Red teamers — sampling frame / eligibility / sample size"), value: str(impl.redTeamers) },
      { label: tr("User testers — sampling frame / eligibility / sample size"), value: str(impl.userTesters) },
      { label: tr("Annotators — sampling frame / expertise / sample size"), value: str(impl.annotators) },
      { label: tr("Data collection considerations (IRB, consent, storage)"), value: str(impl.dataCollection) },
      { label: tr("Data analysis techniques"), value: str(impl.dataAnalysis) },
      { label: tr("Reported results"), value: str(impl.reportedResults) },
    ] }] },
    { id: "results", title: tr("Results summary"), blocks: lastRun ? [
      { type: "score", label: tr("AI Assurance Score (latest run)"), value: (lastRun.summary as Summary).assuranceScore ?? null, verdict: lastRun.verdict },
      { type: "metrics", items: lastRun.metrics.map((m) => { const mm = toMetric(m); return { name: localizeMetricName(locale, m.metricKey, m.name), value: fmtMetric(mm), threshold: fmtThreshold(mm), verdict: m.verdict, category: L(m.category), sampleSize: m.sampleSize ?? undefined }; }) },
      { type: "table", columns: [tr("Run"), tr("Mode"), tr("Sessions"), tr("Findings"), tr("Verdict")], rows: plan.runs.map((r) => [r.code, r.mode, String(r.sessions.length), String(r.findings.length), r.verdict]), badgeColumns: [4] },
    ] : [{ type: "paragraph", text: tr("No runs have been executed for this plan yet."), tone: "muted" }] },
  ];
  return { meta: { reportType: "NIST_ARIA_EVALUATION_REPORT", language: locale, planId: plan.id, generatedAt: new Date().toISOString(), systemName: s.name, systemCode: s.code, organization: s.org.name, runCodes: plan.runs.map((r) => r.code), frameworks: ["NIST_ARIA"] }, sections };
}

export async function buildEvidencePack(systemId: string, frameworkCode: FrameworkCode, locale: Locale = "en"): Promise<ReportContent> {
  const { tr, L } = i18n(locale);
  const s = await loadSystem(systemId);
  const fwRaw = await db.framework.findUniqueOrThrow({ where: { code: frameworkCode }, include: { requirements: { orderBy: { sortOrder: "asc" }, include: { controls: { include: { control: { include: { impls: { where: { systemId } }, evidenceLinks: { include: { evidence: true } } } } } }, evidenceLinks: { include: { evidence: true } } } } } });
  const fw = localizeFramework(locale, { ...fwRaw, requirements: fwRaw.requirements.map((r) => localizeRequirement(locale, frameworkCode, r)) });
  const sysEvidence = await db.evidence.findMany({ where: validEvidenceWhere(s.orgId, systemId), include: { links: { include: { control: true, requirement: true } } }, orderBy: { createdAt: "desc" } });
  const runs = await db.evaluationRun.findMany({ where: { systemId, status: "COMPLETED" }, orderBy: { finishedAt: "desc" } });
  let covered = 0, partial = 0, total = 0;
  const rows: (string | null)[][] = [];
  const gaps: string[] = [];
  for (const r of fw.requirements) {
    const controls = r.controls.map((rc) => rc.control);
    const isHeading = !r.description && controls.length === 0;
    if (isHeading) continue;
    total++;
    const statuses = controls.map((c) => c.impls[0]?.status ?? "NOT_STARTED");
    const evidenceForReq = new Set<string>();
    for (const c of controls) for (const l of c.evidenceLinks) if (evidenceCountsFor(l.evidence, s.orgId, systemId)) evidenceForReq.add(l.evidence.id);
    for (const l of r.evidenceLinks) if (evidenceCountsFor(l.evidence, s.orgId, systemId)) evidenceForReq.add(l.evidence.id);
    const verified = statuses.length > 0 && statuses.every((st) => st === "VERIFIED" || st === "IMPLEMENTED" || st === "NOT_APPLICABLE");
    const some = statuses.some((st) => st === "VERIFIED" || st === "IMPLEMENTED" || st === "IN_PROGRESS") || evidenceForReq.size > 0;
    const status = controls.length === 0 ? "UNMAPPED" : verified && evidenceForReq.size > 0 ? "COVERED" : some ? "PARTIAL" : "GAP";
    if (status === "COVERED") covered++; else if (status === "PARTIAL") partial++;
    if (status === "GAP" || status === "UNMAPPED") gaps.push(`${r.ref} ${r.title}${controls.length ? ` — ${tr("controls")} ${controls.map((c) => c.code).join(", ")} ${tr("not yet implemented")}` : ` — ${tr("no harmonized control mapped; attach evidence directly")}`}`);
    rows.push([r.ref, r.title, controls.map((c) => c.code).join(", ") || "—", status, String(evidenceForReq.size), r.evidenceHint ?? "—"]);
  }
  const coverage = total ? Math.round((covered / total) * 100) : 0;
  const sections: Section[] = [
    { id: "overview", title: tr("Overview"), blocks: [
      { type: "kv", items: [{ label: tr("Framework"), value: `${fw.name}${fw.version ? ` (${fw.version})` : ""}` }, { label: tr("System"), value: `${s.code} · ${s.name}` }, { label: tr("Organization"), value: s.org.name }, { label: tr("Requirements assessed"), value: String(total) }, { label: tr("Covered (controls verified + evidence)"), value: `${covered} (${coverage}%)` }, { label: tr("Partial"), value: String(partial) }, { label: tr("Gaps"), value: String(total - covered - partial) }, { label: tr("Evaluation runs referenced"), value: runs.map((r) => r.code).join(", ") || "—" }] },
      { type: "score", label: tr("Framework coverage"), value: coverage, verdict: coverage >= 80 ? "PASS" : coverage >= 50 ? "WARN" : "FAIL" },
      { type: "paragraph", text: fw.description ?? "", tone: "muted" },
      ...(runs.some((r) => r.mode === "DEMO") ? [{ type: "callout", title: tr("Demo-mode evidence included"), text: tr(DEMO_DISCLAIMER), tone: "warning" } as Block] : []),
    ] },
    systemSection(s, locale),
    { id: "matrix", title: tr("Requirement coverage matrix"), blocks: [{ type: "table", columns: [tr("Ref"), tr("Requirement"), tr("Harmonized controls"), tr("Status"), tr("Evidence"), tr("Expected evidence")], rows, badgeColumns: [3] }] },
    { id: "evidence", title: tr("Evidence index"), blocks: [{ type: "table", columns: [tr("Type"), tr("Title"), tr("Source"), tr("Date"), tr("Linked controls / requirements")], rows: sysEvidence.map((e) => [L(e.type), e.title, e.source, fmtDate(e.createdAt), [...new Set(e.links.map((l) => l.control?.code ?? l.requirement?.ref).filter(Boolean))].join(", ") || "—"]), badgeColumns: [0, 2] }] },
    { id: "gaps", title: tr("Gaps and recommended actions"), blocks: gaps.length ? [{ type: "list", items: gaps }] : [{ type: "paragraph", text: tr("No gaps identified."), tone: "success" }] },
    { id: "risks", title: tr("Risk register extract"), blocks: [{ type: "table", columns: [tr("Code"), tr("Risk"), tr("Dimension"), tr("L"), tr("S"), tr("Score"), tr("Status")], rows: s.risks.map((r) => [r.code, localizeRiskTitle(locale, r.title), L(r.dimension), String(r.likelihood), String(r.severity), String(Math.round(r.score)), r.status]), badgeColumns: [6] }] },
  ];
  const typeMap: Record<string, ReportType> = { ISO_42001: "ISO_42001_EVIDENCE_PACK", EU_AI_ACT: "EU_AI_ACT_EVIDENCE_PACK", NIST_AI_RMF: "NIST_AI_RMF_EVIDENCE_PACK", KR_AI_BASIC_ACT: "KR_AI_BASIC_ACT_EVIDENCE_PACK", NIST_ARIA: "NIST_ARIA_EVALUATION_REPORT" };
  return { meta: { reportType: typeMap[frameworkCode] ?? "ISO_42001_EVIDENCE_PACK", language: locale, generatedAt: new Date().toISOString(), systemName: s.name, systemCode: s.code, organization: s.org.name, frameworks: [frameworkCode], runCodes: runs.map((r) => r.code) }, sections };
}

export async function buildPassport(systemId: string, locale: Locale = "en"): Promise<ReportContent> {
  const { tr, L } = i18n(locale);
  const s = await loadSystem(systemId);
  const runs = await db.evaluationRun.findMany({ where: { systemId }, orderBy: { createdAt: "asc" }, include: { findings: true } });
  const reports = await db.report.findMany({ where: { systemId }, orderBy: { createdAt: "desc" } });
  const evidence = await db.evidence.findMany({ where: { systemId }, orderBy: { createdAt: "desc" } });
  const impls = await db.controlImplementation.findMany({ where: { systemId }, include: { control: true } });
  const sections: Section[] = [
    { id: "identity", title: tr("Identity & lifecycle"), blocks: [{ type: "score", label: tr("Current AI Assurance Score"), value: s.assuranceScore ?? null, verdict: s.assuranceScore === null ? "NOT_EVALUATED" : s.assuranceScore >= 80 ? "PASS" : s.assuranceScore >= 60 ? "WARN" : "FAIL" }] },
    systemSection(s, locale),
    { id: "data", title: tr("Data & third parties"), blocks: [
      { type: "table", columns: [tr("Dataset"), tr("Version"), tr("Purpose"), tr("PII"), tr("Sensitivity")], rows: s.datasets.map((d) => [d.dataset.name, d.dataset.version ?? "—", d.purpose ? tr(d.purpose) : "—", d.dataset.containsPii ? tr("Yes") : tr("No"), d.dataset.sensitivity ? tr(d.dataset.sensitivity) : "—"]) },
      { type: "table", columns: [tr("Vendor"), tr("Role"), tr("Service"), tr("Country"), tr("Risk score")], rows: s.vendors.map((v) => [v.vendor.name, v.role ?? "—", v.vendor.serviceType ?? "—", v.vendor.country ?? "—", v.vendor.riskScore === null ? "—" : String(v.vendor.riskScore)]) },
    ] },
    { id: "assurance", title: tr("Assurance history"), blocks: [{ type: "table", columns: [tr("Run"), tr("Date"), tr("Mode"), tr("Verdict"), tr("Score"), tr("Findings")], rows: runs.map((r) => [r.code, fmtDate(r.finishedAt ?? r.createdAt), r.mode, r.verdict, String((r.summary as Summary).assuranceScore ?? "—"), String(r.findings.length)]), badgeColumns: [3] }] },
    { id: "controls", title: tr("Control implementation status"), blocks: [{ type: "table", columns: [tr("Control"), tr("Name"), tr("Status"), tr("Last verified")], rows: impls.map((i) => [i.control.code, localizeControl(locale, i.control).name, i.status, fmtDate(i.lastVerifiedAt)]), badgeColumns: [2] }] },
    { id: "risks", title: tr("Risk register"), blocks: [{ type: "table", columns: [tr("Code"), tr("Risk"), tr("Dimension"), tr("Score"), tr("Status"), tr("Source")], rows: s.risks.map((r) => [r.code, localizeRiskTitle(locale, r.title), L(r.dimension), String(Math.round(r.score)), r.status, r.source]), badgeColumns: [4] }] },
    { id: "changes", title: tr("Change events (re-test triggers)"), blocks: s.changeEvents.length ? [{ type: "table", columns: [tr("Date"), tr("Type"), tr("Description"), tr("Re-test required"), tr("Categories")], rows: s.changeEvents.map((c) => [fmtDate(c.createdAt), L(c.type), c.description, c.requiresRetest ? tr("Yes") : tr("No"), c.retestCategories.map((x) => L(x)).join(", ") || "—"]) }] : [{ type: "paragraph", text: tr("No change events recorded."), tone: "muted" }] },
    { id: "docs", title: tr("Evidence & reports"), blocks: [
      { type: "table", columns: [tr("Evidence type"), tr("Title"), tr("Source"), tr("Status"), tr("Date")], rows: evidence.map((e) => [L(e.type), e.title, e.source, e.status, fmtDate(e.createdAt)]), badgeColumns: [0, 3] },
      { type: "table", columns: [tr("Report"), tr("Type"), tr("Version"), tr("Status"), tr("Issued")], rows: reports.map((r) => [r.code, L(r.type), `v${r.version}`, r.status, fmtDate(r.issuedAt)]), badgeColumns: [3] },
    ] },
  ];
  return { meta: { reportType: "AI_PASSPORT", language: locale, generatedAt: new Date().toISOString(), systemName: s.name, systemCode: s.code, organization: s.org.name, runCodes: runs.map((r) => r.code) }, sections };
}
