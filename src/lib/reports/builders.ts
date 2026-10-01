import { db } from "@/lib/db";
import { enumLabel, fmtDate, num, pct } from "@/lib/utils";
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

async function loadSystem(systemId: string) {
  return db.aiSystem.findUniqueOrThrow({
    where: { id: systemId },
    include: { org: true, owner: true, technicalOwner: true, models: true, agentProfile: true, datasets: { include: { dataset: true } }, vendors: { include: { vendor: true } }, risks: { orderBy: { score: "desc" } }, changeEvents: { orderBy: { createdAt: "desc" } } },
  });
}

function systemSection(s: Awaited<ReturnType<typeof loadSystem>>): Section {
  const items = [
    { label: "System", value: `${s.code} · ${s.name}` },
    { label: "Type", value: enumLabel(s.type) },
    { label: "Sector", value: s.sector ?? "—" },
    { label: "Purpose", value: s.purpose ?? "—" },
    { label: "Lifecycle stage", value: enumLabel(s.lifecycleStage) },
    { label: "Risk tier", value: enumLabel(s.riskTier) },
    { label: "EU AI Act classification", value: enumLabel(s.euAiActCategory) + (s.euAiActAnnexIIIArea ? ` (${s.euAiActAnnexIIIArea})` : "") },
    { label: "Owner", value: s.owner?.name ?? "—" },
    { label: "Technical owner", value: s.technicalOwner?.name ?? "—" },
    { label: "Models", value: s.models.map((m) => `${m.provider} ${m.name}${m.version ? ` v${m.version}` : ""}`).join("; ") || "—" },
    { label: "Personal data", value: s.usesPersonalData ? (s.usesSensitiveData ? "Yes (incl. sensitive)" : "Yes") : "No" },
    { label: "Human oversight", value: s.humanOversight ?? "—" },
  ];
  const blocks: Block[] = [{ type: "kv", items }];
  if (s.agentProfile) {
    const tools = (s.agentProfile.tools as { name: string; riskLevel?: string; allowed?: boolean; permissions?: string[] }[]) ?? [];
    blocks.push({ type: "paragraph", text: `Agent profile — framework: ${s.agentProfile.framework ?? "n/a"}, autonomy: ${enumLabel(s.agentProfile.autonomyLevel)}, kill switch: ${s.agentProfile.killSwitch ? "yes" : "no"}${s.agentProfile.maxBudgetUsd ? `, budget cap $${s.agentProfile.maxBudgetUsd}` : ""}.` });
    blocks.push({ type: "table", columns: ["Tool", "Risk level", "Allowed", "Permissions"], rows: tools.map((t) => [t.name, t.riskLevel ?? "—", t.allowed === false ? "No" : "Yes", (t.permissions ?? []).join(", ") || "—"]), badgeColumns: [1, 2] });
  }
  return { id: "system", title: "System under evaluation", blocks };
}

export async function buildEvaluationReport(runId: string): Promise<ReportContent> {
  const run = await db.evaluationRun.findUniqueOrThrow({ where: { id: runId }, include: { system: { include: { org: true } }, plan: true, metrics: true, findings: { orderBy: { severity: "desc" } }, sessions: { include: { scenario: { include: { method: true } }, annotations: true } } } });
  const s = await loadSystem(run.systemId);
  const summary = run.summary as Summary;
  const env = run.environment as Record<string, unknown>;
  const byType = new Map<string, number>();
  for (const ss of run.sessions) byType.set(ss.testingType, (byType.get(ss.testingType) ?? 0) + 1);
  const scenarioRows = (summary.scenarios ?? []).map((sc) => [sc.code, sc.name, enumLabel(sc.category), enumLabel(sc.testingType), String(run.sessions.filter((x) => x.scenario.code === sc.code).length), String(run.sessions.filter((x) => x.scenario.code === sc.code && x.verdict === "FAIL").length)]);
  const sections: Section[] = [
    { id: "summary", title: "Executive summary", blocks: [
      { type: "score", label: "AI Assurance Score", value: summary.assuranceScore ?? null, verdict: summary.verdict ?? run.verdict },
      { type: "kv", items: [
        { label: "Run", value: `${run.code} · ${run.name}` },
        { label: "Mode", value: run.mode },
        { label: "Target", value: summary.target ?? String(env.target ?? "—") },
        { label: "Judge", value: summary.judge ?? "—" },
        { label: "Executed", value: `${fmtDate(run.startedAt, true)} → ${fmtDate(run.finishedAt, true)}` },
        { label: "Sessions", value: `${summary.counts?.sessions ?? run.sessions.length} (pass ${summary.counts?.passed ?? 0}, fail ${summary.counts?.failed ?? 0})` },
        { label: "Findings", value: `${run.findings.length} (critical ${run.findings.filter((f) => f.severity === "CRITICAL").length}, high ${run.findings.filter((f) => f.severity === "HIGH").length})` },
      ] },
      { type: "paragraph", text: summary.verdict === "PASS" ? "All evaluated metrics met their acceptance thresholds. The system is recommended for approval for the evaluated scope, subject to continuous monitoring and re-test on change." : summary.verdict === "WARN" ? "One or more metrics are within the warning band. Remediation is recommended before deployment approval; see findings." : "One or more acceptance thresholds were not met or critical findings were raised. Deployment approval should be withheld until findings are mitigated and the affected scenarios are re-run.", tone: summary.verdict === "PASS" ? "success" : summary.verdict === "WARN" ? "warning" : "danger" },
      { type: "callout", title: run.mode === "DEMO" ? "Demo mode" : "Methodological note", text: run.mode === "DEMO" ? DEMO_DISCLAIMER : LIVE_DISCLAIMER, tone: run.mode === "DEMO" ? "warning" : "info" },
    ] },
    systemSection(s),
    { id: "method", title: "Methodology (NIST AI 200-3 ARIA-style)", blocks: [
      { type: "paragraph", text: `The evaluation combined ${[...byType.keys()].map((k) => enumLabel(k)).join(", ")} sessions. Each session is a tester–application interaction identified by SessionID with TesterID, ApplicationID, ScenarioID and TestingType; dialogues, tool calls and annotations were logged per the ARIA data schema. Annotation used rule-based checks plus ${run.mode === "DEMO" ? "a simulated judge over ground-truth tags" : "an LLM-as-judge with structured rationale and confidence"}. Metrics aggregate annotation items per test method and are compared against pre-registered acceptance thresholds.` },
      { type: "table", columns: ["Scenario", "Name", "Category", "Testing type", "Sessions", "Failed"], rows: scenarioRows, badgeColumns: [2, 3] },
      { type: "kv", items: Object.entries(env).map(([k, v]) => ({ label: k, value: v === null ? "—" : String(v) })) },
    ] },
    { id: "results", title: "Results by metric", blocks: [
      { type: "metrics", items: run.metrics.map((m) => { const mm = toMetric(m); return { name: m.name, value: fmtMetric(mm), threshold: fmtThreshold(mm), verdict: m.verdict, category: enumLabel(m.category), sampleSize: m.sampleSize ?? undefined }; }) },
      { type: "table", columns: ["Category", "Category score"], rows: Object.entries(summary.byCategory ?? {}).map(([k, v]) => [enumLabel(k), `${v}/100`]) },
    ] },
    { id: "findings", title: "Findings", blocks: run.findings.length ? [{ type: "findings", items: run.findings.map((f) => ({ code: f.code, title: f.title, severity: f.severity, category: enumLabel(f.category), excerpt: f.evidenceExcerpt ?? undefined, recommendation: f.recommendation ?? undefined, status: f.status })) }] : [{ type: "paragraph", text: "No findings were raised.", tone: "success" }] },
    { id: "traceability", title: "Traceability: controls verified by this run", blocks: await traceabilityBlocks(run.sessions.map((x) => x.scenario.method.id), run.systemId) },
    { id: "limitations", title: "Limitations", blocks: [{ type: "list", items: [
      "Results apply to the evaluated scenarios, prompt sets and configuration only; generalisation to other contexts of use is limited (NIST AI 200-3 §7).",
      "Automated red teaming complements but does not replace human red teaming; dynamic human adversaries may find failure modes not covered here.",
      run.mode === "DEMO" ? DEMO_DISCLAIMER : LLM_JUDGE_LIMIT,
      "Any change to model version, prompts, tools or data sources invalidates these results until the affected categories are re-tested (change-triggered re-evaluation).",
    ] }] },
  ];
  return { meta: { reportType: "EVALUATION_REPORT", generatedAt: new Date().toISOString(), systemName: s.name, systemCode: s.code, organization: s.org.name, runCodes: [run.code], mode: run.mode, disclaimer: run.mode === "DEMO" ? DEMO_DISCLAIMER : undefined }, sections };
}
const LLM_JUDGE_LIMIT = "LLM-as-judge annotations carry model-dependent variance; multiple judge runs and human validation of a sample are recommended before relying on borderline results.";

async function traceabilityBlocks(methodIds: string[], systemId: string): Promise<Block[]> {
  const methods = await db.testMethod.findMany({ where: { id: { in: [...new Set(methodIds)] } }, include: { controls: { include: { control: { include: { requirements: { include: { requirement: { include: { framework: true } } } }, impls: { where: { systemId } } } } } } } });
  const rows: (string | null)[][] = [];
  for (const m of methods) for (const cm of m.controls) {
    const c = cm.control;
    const refs = c.requirements.map((rc) => `${enumLabel(rc.requirement.framework.code)} ${rc.requirement.ref}`).slice(0, 8).join("; ");
    rows.push([m.code, m.name, c.code, c.name, c.impls[0]?.status ?? "NOT_STARTED", refs]);
  }
  return [{ type: "paragraph", text: "Each test method is mapped to harmonized controls, which in turn map to framework requirements. Passing metrics mark the control as VERIFIED for this system and attach generated evidence." }, { type: "table", columns: ["Method", "Test method", "Control", "Harmonized control", "Status", "Requirements"], rows, badgeColumns: [4] }];
}

export async function buildVerificationReport(runIds: string[], opts: { tester?: string; reviewer?: string; approver?: string } = {}): Promise<ReportContent> {
  const runs = await db.evaluationRun.findMany({ where: { id: { in: runIds } }, include: { metrics: true, findings: true, sessions: { include: { scenario: { include: { method: true } } } } }, orderBy: { createdAt: "asc" } });
  if (!runs.length) throw new Error("No runs");
  const s = await loadSystem(runs[0].systemId);
  const methodsUsed = new Map<string, { code: string; name: string; standardRef: string | null; category: string }>();
  for (const r of runs) for (const ss of r.sessions) methodsUsed.set(ss.scenario.method.id, { code: ss.scenario.method.code, name: ss.scenario.method.name, standardRef: ss.scenario.method.standardRef, category: ss.scenario.method.category });
  const metricRows = runs.flatMap((r) => r.metrics.map((m) => {
    const method = [...methodsUsed.values()].find((x) => x.category === m.category);
    const mm = toMetric(m);
    return [method?.code ?? "—", m.name, method?.standardRef ?? "—", fmtThreshold(mm), fmtMetric(mm), String(m.sampleSize ?? "—"), m.verdict];
  }));
  const overall = runs.every((r) => r.verdict === "PASS") ? "PASS" : runs.some((r) => r.verdict === "FAIL") ? "FAIL" : "WARN";
  const anyDemo = runs.some((r) => r.mode === "DEMO");
  const sections: Section[] = [
    { id: "id", title: "Report identification", blocks: [{ type: "kv", items: [
      { label: "Report type", value: "AI System Verification Report (test report)" },
      { label: "Organization", value: s.org.name },
      { label: "Evaluation run(s)", value: runs.map((r) => r.code).join(", ") },
      { label: "Test period", value: `${fmtDate(runs[0].startedAt, true)} → ${fmtDate(runs[runs.length - 1].finishedAt, true)}` },
      { label: "Test mode", value: runs.map((r) => r.mode).join(", ") },
      { label: "Overall judgement", value: overall },
    ] }, ...(anyDemo ? [{ type: "callout", title: "Demo mode", text: DEMO_DISCLAIMER, tone: "warning" } as Block] : [])] },
    systemSection(s),
    { id: "items", title: "Test items, methods and acceptance criteria", blocks: [
      { type: "table", columns: ["Method", "Test method", "Reference standard / guidance", "Category"], rows: [...methodsUsed.values()].map((m) => [m.code, m.name, m.standardRef ?? "—", enumLabel(m.category)]), badgeColumns: [3] },
    ] },
    { id: "results", title: "Test results", blocks: [
      { type: "table", columns: ["Method", "Metric", "Reference", "Acceptance criterion", "Measured", "n", "Verdict"], rows: metricRows, badgeColumns: [6] },
      { type: "score", label: "Overall judgement", value: null, verdict: overall },
    ] },
    { id: "conditions", title: "Test conditions & environment", blocks: runs.map((r) => ({ type: "kv", items: [{ label: "Run", value: r.code }, ...Object.entries(r.environment as Record<string, unknown>).map(([k, v]) => ({ label: k, value: v === null ? "—" : String(v) }))] }) as Block) },
    { id: "nonconformities", title: "Nonconformities and observations", blocks: runs.flatMap((r) => r.findings).length ? [{ type: "findings", items: runs.flatMap((r) => r.findings).map((f) => ({ code: f.code, title: f.title, severity: f.severity, category: enumLabel(f.category), excerpt: f.evidenceExcerpt ?? undefined, recommendation: f.recommendation ?? undefined, status: f.status })) }] : [{ type: "paragraph", text: "No nonconformities observed.", tone: "success" }] },
    { id: "deviations", title: "Deviations, limitations and statement", blocks: [
      { type: "list", items: ["Results relate only to the items tested under the stated conditions.", "This report shall not be reproduced except in full without written approval of the issuing body.", anyDemo ? DEMO_DISCLAIMER : LLM_JUDGE_LIMIT, "Re-testing is required after any substantial modification (model version, prompt, tool, data source) per the change-impact policy."] },
    ] },
    { id: "signatures", title: "Tester / Reviewer / Approver", blocks: [{ type: "signatures", roles: [{ role: "Tester", name: opts.tester ?? "", date: "" }, { role: "Technical reviewer", name: opts.reviewer ?? "", date: "" }, { role: "Authorised approver", name: opts.approver ?? "", date: "" }] }] },
  ];
  return { meta: { reportType: "VERIFICATION_REPORT", generatedAt: new Date().toISOString(), systemName: s.name, systemCode: s.code, organization: s.org.name, runCodes: runs.map((r) => r.code), mode: runs.map((r) => r.mode).join("/"), disclaimer: anyDemo ? DEMO_DISCLAIMER : undefined }, sections };
}

export async function buildAriaReport(planId: string): Promise<ReportContent> {
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
    { id: "b1", title: "B.1 Scope", blocks: [{ type: "kv", items: [
      { label: "AI application(s) being evaluated", value: str(scope.applications) || `${s.code} ${s.name}` },
      { label: "Sector", value: str(scope.sector ?? s.sector) },
      { label: "Intended use cases", value: str(scope.useCases) },
      { label: "Target concept", value: str(scope.targetConcept) },
    ] }] },
    { id: "b2", title: "B.2 Design", blocks: [{ type: "kv", items: [
      { label: "Goal of Model Testing", value: str(design.modelTestingGoal) },
      { label: "Goal of Red Teaming", value: str(design.redTeamingGoal) },
      { label: "Goal of User Testing", value: str(design.userTestingGoal) },
      { label: "Distribution of testers", value: str(design.testerDistribution) },
    ] }] },
    { id: "b3", title: "B.3 Materials", blocks: [
      { type: "kv", items: [{ label: "Scenarios", value: plan.scenarios.map((ps) => `${ps.scenario.code} ${ps.scenario.name}`).join("; ") || "—" }, { label: "Components captured by Model Testing prompts", value: str(materials.modelTestingComponents) }, { label: "Red Teaming instructions", value: str(materials.redTeamingInstructions) }, { label: "User Testing instructions", value: str(materials.userTestingInstructions) }, { label: "Annotation schema components", value: str(materials.annotationComponents) }] },
      { type: "table", columns: ["Scenario", "Testing type", "Prompts / sample", "Annotation items", "Questionnaire items"], rows: plan.scenarios.map((ps) => [ps.scenario.code, enumLabel(ps.testingType), String(ps.sampleSize ?? (ps.scenario.prompts as unknown[]).length), String((ps.scenario.annotationSchema as unknown[]).length), String((ps.scenario.questionnaire as unknown[]).length)]), badgeColumns: [1] },
    ] },
    { id: "b4", title: "B.4 Infrastructure", blocks: [{ type: "list", items: [
      `Testing platform: K-VeriAI evaluation engine — prompt delivery, dialogue collection, tester assignment, instruction display, questionnaire administration (${str(infra.platform ?? "all components")})`,
      "Data schema: SessionID, Date/Time, TesterID, ApplicationID, ScenarioID, TestingType; Dialogues, Questionnaires, Annotations (implemented as TestSession / DialogueTurn / QuestionnaireResponse / Annotation).",
      `Annotation tool: rule-based checks + ${str(infra.annotationTool ?? "LLM-as-judge with human validation sample")}.`,
      `Scoring tool: metric aggregation per test method, severity weighting, category scores and AI Assurance Score (${str(infra.scoringTool ?? "built-in")}).`,
      `Evaluation API: ${str(infra.evaluationApi ?? "adapter (Anthropic / OpenAI-compatible / HTTP Evaluation API / demo)")}.`,
    ] }] },
    { id: "b5", title: "B.5 Implementation", blocks: [{ type: "kv", items: [
      { label: "Red teamers — sampling frame / eligibility / sample size", value: str(impl.redTeamers) },
      { label: "User testers — sampling frame / eligibility / sample size", value: str(impl.userTesters) },
      { label: "Annotators — sampling frame / expertise / sample size", value: str(impl.annotators) },
      { label: "Data collection considerations (IRB, consent, storage)", value: str(impl.dataCollection) },
      { label: "Data analysis techniques", value: str(impl.dataAnalysis) },
      { label: "Reported results", value: str(impl.reportedResults) },
    ] }] },
    { id: "results", title: "Results summary", blocks: lastRun ? [
      { type: "score", label: "AI Assurance Score (latest run)", value: (lastRun.summary as Summary).assuranceScore ?? null, verdict: lastRun.verdict },
      { type: "metrics", items: lastRun.metrics.map((m) => { const mm = toMetric(m); return { name: m.name, value: fmtMetric(mm), threshold: fmtThreshold(mm), verdict: m.verdict, category: enumLabel(m.category), sampleSize: m.sampleSize ?? undefined }; }) },
      { type: "table", columns: ["Run", "Mode", "Sessions", "Findings", "Verdict"], rows: plan.runs.map((r) => [r.code, r.mode, String(r.sessions.length), String(r.findings.length), r.verdict]), badgeColumns: [4] },
    ] : [{ type: "paragraph", text: "No runs have been executed for this plan yet.", tone: "muted" }] },
  ];
  return { meta: { reportType: "NIST_ARIA_EVALUATION_REPORT", generatedAt: new Date().toISOString(), systemName: s.name, systemCode: s.code, organization: s.org.name, runCodes: plan.runs.map((r) => r.code), frameworks: ["NIST_ARIA"] }, sections };
}

export async function buildEvidencePack(systemId: string, frameworkCode: FrameworkCode): Promise<ReportContent> {
  const s = await loadSystem(systemId);
  const fw = await db.framework.findUniqueOrThrow({ where: { code: frameworkCode }, include: { requirements: { orderBy: { sortOrder: "asc" }, include: { controls: { include: { control: { include: { impls: { where: { systemId } }, evidenceLinks: { include: { evidence: true } } } } } }, evidenceLinks: { include: { evidence: true } } } } } });
  const sysEvidence = await db.evidence.findMany({ where: { systemId, status: "VALID" }, include: { links: { include: { control: true, requirement: true } } }, orderBy: { createdAt: "desc" } });
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
    for (const c of controls) for (const l of c.evidenceLinks) if (l.evidence.systemId === systemId && l.evidence.status === "VALID") evidenceForReq.add(l.evidence.id);
    for (const l of r.evidenceLinks) if (l.evidence.systemId === systemId && l.evidence.status === "VALID") evidenceForReq.add(l.evidence.id);
    const verified = statuses.length > 0 && statuses.every((st) => st === "VERIFIED" || st === "IMPLEMENTED" || st === "NOT_APPLICABLE");
    const some = statuses.some((st) => st === "VERIFIED" || st === "IMPLEMENTED" || st === "IN_PROGRESS") || evidenceForReq.size > 0;
    const status = controls.length === 0 ? "UNMAPPED" : verified && evidenceForReq.size > 0 ? "COVERED" : some ? "PARTIAL" : "GAP";
    if (status === "COVERED") covered++; else if (status === "PARTIAL") partial++;
    if (status === "GAP" || status === "UNMAPPED") gaps.push(`${r.ref} ${r.title}${controls.length ? ` — controls ${controls.map((c) => c.code).join(", ")} not yet implemented` : " — no harmonized control mapped; attach evidence directly"}`);
    rows.push([r.ref, r.title, controls.map((c) => c.code).join(", ") || "—", status, String(evidenceForReq.size), r.evidenceHint ?? "—"]);
  }
  const coverage = total ? Math.round((covered / total) * 100) : 0;
  const sections: Section[] = [
    { id: "overview", title: "Overview", blocks: [
      { type: "kv", items: [{ label: "Framework", value: `${fw.name}${fw.version ? ` (${fw.version})` : ""}` }, { label: "System", value: `${s.code} · ${s.name}` }, { label: "Organization", value: s.org.name }, { label: "Requirements assessed", value: String(total) }, { label: "Covered (controls verified + evidence)", value: `${covered} (${coverage}%)` }, { label: "Partial", value: String(partial) }, { label: "Gaps", value: String(total - covered - partial) }, { label: "Evaluation runs referenced", value: runs.map((r) => r.code).join(", ") || "—" }] },
      { type: "score", label: "Framework coverage", value: coverage, verdict: coverage >= 80 ? "PASS" : coverage >= 50 ? "WARN" : "FAIL" },
      { type: "paragraph", text: fw.description ?? "", tone: "muted" },
      ...(runs.some((r) => r.mode === "DEMO") ? [{ type: "callout", title: "Demo-mode evidence included", text: DEMO_DISCLAIMER, tone: "warning" } as Block] : []),
    ] },
    systemSection(s),
    { id: "matrix", title: "Requirement coverage matrix", blocks: [{ type: "table", columns: ["Ref", "Requirement", "Harmonized controls", "Status", "Evidence", "Expected evidence"], rows, badgeColumns: [3] }] },
    { id: "evidence", title: "Evidence index", blocks: [{ type: "table", columns: ["Type", "Title", "Source", "Date", "Linked controls / requirements"], rows: sysEvidence.map((e) => [enumLabel(e.type), e.title, e.source, fmtDate(e.createdAt), [...new Set(e.links.map((l) => l.control?.code ?? l.requirement?.ref).filter(Boolean))].join(", ") || "—"]), badgeColumns: [0, 2] }] },
    { id: "gaps", title: "Gaps and recommended actions", blocks: gaps.length ? [{ type: "list", items: gaps }] : [{ type: "paragraph", text: "No gaps identified.", tone: "success" }] },
    { id: "risks", title: "Risk register extract", blocks: [{ type: "table", columns: ["Code", "Risk", "Dimension", "L", "S", "Score", "Status"], rows: s.risks.map((r) => [r.code, r.title, enumLabel(r.dimension), String(r.likelihood), String(r.severity), String(Math.round(r.score)), r.status]), badgeColumns: [6] }] },
  ];
  const typeMap: Record<string, ReportType> = { ISO_42001: "ISO_42001_EVIDENCE_PACK", EU_AI_ACT: "EU_AI_ACT_EVIDENCE_PACK", NIST_AI_RMF: "NIST_AI_RMF_EVIDENCE_PACK", KR_AI_BASIC_ACT: "KR_AI_BASIC_ACT_EVIDENCE_PACK", NIST_ARIA: "NIST_ARIA_EVALUATION_REPORT" };
  return { meta: { reportType: typeMap[frameworkCode] ?? "ISO_42001_EVIDENCE_PACK", generatedAt: new Date().toISOString(), systemName: s.name, systemCode: s.code, organization: s.org.name, frameworks: [frameworkCode], runCodes: runs.map((r) => r.code) }, sections };
}

export async function buildPassport(systemId: string): Promise<ReportContent> {
  const s = await loadSystem(systemId);
  const runs = await db.evaluationRun.findMany({ where: { systemId }, orderBy: { createdAt: "asc" }, include: { findings: true } });
  const reports = await db.report.findMany({ where: { systemId }, orderBy: { createdAt: "desc" } });
  const evidence = await db.evidence.findMany({ where: { systemId }, orderBy: { createdAt: "desc" } });
  const impls = await db.controlImplementation.findMany({ where: { systemId }, include: { control: true } });
  const sections: Section[] = [
    { id: "identity", title: "Identity & lifecycle", blocks: [{ type: "score", label: "Current AI Assurance Score", value: s.assuranceScore ?? null, verdict: s.assuranceScore === null ? "NOT_EVALUATED" : s.assuranceScore >= 80 ? "PASS" : s.assuranceScore >= 60 ? "WARN" : "FAIL" }] },
    systemSection(s),
    { id: "data", title: "Data & third parties", blocks: [
      { type: "table", columns: ["Dataset", "Version", "Purpose", "PII", "Sensitivity"], rows: s.datasets.map((d) => [d.dataset.name, d.dataset.version ?? "—", d.purpose ?? "—", d.dataset.containsPii ? "Yes" : "No", d.dataset.sensitivity ?? "—"]) },
      { type: "table", columns: ["Vendor", "Role", "Service", "Country", "Risk score"], rows: s.vendors.map((v) => [v.vendor.name, v.role ?? "—", v.vendor.serviceType ?? "—", v.vendor.country ?? "—", v.vendor.riskScore === null ? "—" : String(v.vendor.riskScore)]) },
    ] },
    { id: "assurance", title: "Assurance history", blocks: [{ type: "table", columns: ["Run", "Date", "Mode", "Verdict", "Score", "Findings"], rows: runs.map((r) => [r.code, fmtDate(r.finishedAt ?? r.createdAt), r.mode, r.verdict, String((r.summary as Summary).assuranceScore ?? "—"), String(r.findings.length)]), badgeColumns: [3] }] },
    { id: "controls", title: "Control implementation status", blocks: [{ type: "table", columns: ["Control", "Name", "Status", "Last verified"], rows: impls.map((i) => [i.control.code, i.control.name, i.status, fmtDate(i.lastVerifiedAt)]), badgeColumns: [2] }] },
    { id: "risks", title: "Risk register", blocks: [{ type: "table", columns: ["Code", "Risk", "Dimension", "Score", "Status", "Source"], rows: s.risks.map((r) => [r.code, r.title, enumLabel(r.dimension), String(Math.round(r.score)), r.status, r.source]), badgeColumns: [4] }] },
    { id: "changes", title: "Change events (re-test triggers)", blocks: s.changeEvents.length ? [{ type: "table", columns: ["Date", "Type", "Description", "Re-test required", "Categories"], rows: s.changeEvents.map((c) => [fmtDate(c.createdAt), enumLabel(c.type), c.description, c.requiresRetest ? "Yes" : "No", c.retestCategories.map(enumLabel).join(", ") || "—"]) }] : [{ type: "paragraph", text: "No change events recorded.", tone: "muted" }] },
    { id: "docs", title: "Evidence & reports", blocks: [
      { type: "table", columns: ["Evidence type", "Title", "Source", "Status", "Date"], rows: evidence.map((e) => [enumLabel(e.type), e.title, e.source, e.status, fmtDate(e.createdAt)]), badgeColumns: [0, 3] },
      { type: "table", columns: ["Report", "Type", "Version", "Status", "Issued"], rows: reports.map((r) => [r.code, enumLabel(r.type), `v${r.version}`, r.status, fmtDate(r.issuedAt)]), badgeColumns: [3] },
    ] },
  ];
  return { meta: { reportType: "AI_PASSPORT", generatedAt: new Date().toISOString(), systemName: s.name, systemCode: s.code, organization: s.org.name, runCodes: runs.map((r) => r.code) }, sections };
}
