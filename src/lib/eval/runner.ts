import { db } from "@/lib/db";
import { defaultDueDate } from "@/lib/risks/due";
import { syncControlStatuses } from "@/lib/controls/status";
import { decryptSecret } from "@/lib/crypto";
import { createTargetAdapter } from "./adapters";
import { createJudges, mergeJudgeResults } from "./judge";
import { executeSandboxTool, SANDBOX_TOOLS, toolByName } from "./tools";
import { assuranceScore, computeMetric, isViolation, metricGoodness, overallVerdict, verdictFor, type SessionAnnotations, type VerdictValue } from "./metrics";
import type { AnnotationItem, ChatMessage, JudgeConfig, MetricSpec, ScenarioPrompt, TargetConfig, ToolSpec } from "./types";
import type { Severity, TestCategory, EvidenceType, Prisma } from "@/generated/prisma/client";

const MAX_TOOL_ITERATIONS = 6;
const running = new Set<string>();

type ScenarioRow = {
  id: string; code: string; name: string; targetConcept: string | null; instructions: string | null; tactic: string | null;
  prompts: unknown; annotationSchema: unknown; defaultSeverity: Severity;
  method: { id: string; code: string; name: string; category: TestCategory; testingType: "MODEL_TESTING" | "RED_TEAMING" | "USER_TESTING"; metrics: unknown; judgeRubric: string | null; controls: { controlId: string }[] };
};

function sevRank(s: Severity) { return ["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"].indexOf(s); }

async function resolveCredential(orgId: string, cfg: TargetConfig | JudgeConfig) {
  if (cfg.apiKey || cfg.adapter === "demo" || cfg.adapter === "rule" || cfg.adapter === "http") return cfg;
  const provider = cfg.adapter === "openai-compatible" ? "openai-compatible" : cfg.adapter;
  const cred = await db.providerCredential.findFirst({ where: { orgId, provider }, orderBy: { createdAt: "desc" } });
  if (cred) return { ...cfg, apiKey: decryptSecret(cred.encryptedKey), baseUrl: cfg.baseUrl ?? cred.baseUrl ?? undefined, model: cfg.model ?? cred.defaultModel ?? undefined };
  return cfg;
}

/** Kick off a run in the background (idempotent). */
export function startRunInBackground(runId: string) {
  if (running.has(runId)) return;
  running.add(runId);
  setImmediate(() => {
    executeRun(runId)
      .catch(async (err) => {
        console.error("[k-veriai] run failed", runId, err);
        await db.evaluationRun.update({ where: { id: runId }, data: { status: "FAILED", error: String(err?.message ?? err), finishedAt: new Date() } }).catch(() => {});
      })
      .finally(() => running.delete(runId));
  });
}

export async function executeRun(runId: string) {
  const run = await db.evaluationRun.findUnique({
    where: { id: runId },
    include: { system: { include: { agentProfile: true } }, plan: { include: { scenarios: { include: { scenario: { include: { method: { include: { controls: true } } } } } } } } },
  });
  if (!run) throw new Error("Run not found");
  if (run.status === "RUNNING") return;

  const targetCfg = (await resolveCredential(run.orgId, run.targetConfig as unknown as TargetConfig)) as TargetConfig;
  const judgeCfgRaw = run.judgeConfig as unknown as JudgeConfig;
  const judgeCfg = (await resolveCredential(run.orgId, judgeCfgRaw?.adapter ? judgeCfgRaw : { ...(judgeCfgRaw ?? {}), adapter: "demo" })) as JudgeConfig;
  const mode = run.mode;
  if (mode === "DEMO") { targetCfg.adapter = "demo"; targetCfg.seed = targetCfg.seed ?? run.id; }

  // Scenario set: from plan, or explicit scenarioIds in targetConfig
  let scenarios: ScenarioRow[] = run.plan?.scenarios.map((ps) => ps.scenario as unknown as ScenarioRow) ?? [];
  const explicit = (run.targetConfig as { scenarioIds?: string[] }).scenarioIds;
  if (explicit?.length) {
    scenarios = (await db.testScenario.findMany({ where: { id: { in: explicit } }, include: { method: { include: { controls: true } } } })) as unknown as ScenarioRow[];
  }
  if (!scenarios.length) throw new Error("No scenarios selected for this run");

  await db.evaluationRun.update({ where: { id: runId }, data: { status: "RUNNING", startedAt: new Date(), progress: 0, error: null, environment: { ...(run.environment as object), executedAt: new Date().toISOString(), target: targetCfg.adapter, model: targetCfg.model ?? null, judge: judgeCfg.adapter, judgeModel: judgeCfg.model ?? null, mode } } });
  await db.testSession.deleteMany({ where: { runId } });
  await db.metricResult.deleteMany({ where: { runId } });
  await db.finding.deleteMany({ where: { runId } });

  const adapter = createTargetAdapter(targetCfg);
  const judges = createJudges(judgeCfg, mode);
  await adapter.openConnection();

  // Tools available to the governed agent (from agent profile, falling back to sandbox catalogue)
  const profileTools = (run.system.agentProfile?.tools as { name: string; allowed?: boolean; riskLevel?: string }[] | undefined) ?? [];
  const isAgent = run.system.type === "AGENT" || run.system.type === "MULTI_AGENT";
  const tools: ToolSpec[] = isAgent
    ? SANDBOX_TOOLS.map((t) => {
        const p = profileTools.find((x) => x.name === t.name);
        return p ? { ...t, allowed: p.allowed ?? t.allowed } : t;
      })
    : [];

  const totalPrompts = scenarios.reduce((n, s) => n + Math.max(1, (s.prompts as ScenarioPrompt[]).length), 0);
  let done = 0;
  const sessionAnnots: { scenario: ScenarioRow; ann: SessionAnnotations; verdict: VerdictValue; severity: Severity | null; sessionId: string; promptObj: ScenarioPrompt; excerpt: string; violations: string[] }[] = [];

  for (const sc of scenarios) {
    const prompts = (sc.prompts as ScenarioPrompt[]).length ? (sc.prompts as ScenarioPrompt[]) : [{ id: "p1", turns: [{ role: "user" as const, content: sc.instructions ?? sc.name }] }];
    const items = sc.annotationSchema as AnnotationItem[];
    for (const prompt of prompts) {
      const session = await db.testSession.create({ data: { runId, scenarioId: sc.id, testingType: sc.method.testingType, testerId: sc.method.testingType === "MODEL_TESTING" ? `promptset:${sc.code}` : `auto-redteam:${sc.code}`, promptRef: prompt.id } });
      await adapter.startSession(session.id);
      if ("setFailureHint" in adapter && typeof (adapter as { setFailureHint?: unknown }).setFailureHint === "function") (adapter as unknown as { setFailureHint: (h: string | undefined) => void }).setFailureHint(prompt.demoFailureMode);
      const dialogue: (ChatMessage & { demoMeta?: Record<string, unknown>; latencyMs?: number })[] = [];
      let idx = 0;
      const persistTurn = async (m: ChatMessage & { latencyMs?: number; inputTokens?: number; outputTokens?: number }) => {
        await db.dialogueTurn.create({ data: { sessionId: session.id, index: idx++, role: m.role.toUpperCase() as "USER" | "ASSISTANT" | "TOOL" | "SYSTEM", content: m.content, toolCalls: m.toolCalls ? (m.toolCalls as unknown as Prisma.InputJsonValue) : undefined, latencyMs: m.latencyMs, inputTokens: m.inputTokens, outputTokens: m.outputTokens } });
      };
      if (prompt.context) {
        const ctxMsg: ChatMessage = { role: "system", content: `[CONTEXT] ${prompt.context}` };
        dialogue.push(ctxMsg); await persistTurn(ctxMsg);
      }
      let lastResponse = { content: "", latencyMs: 0 };
      try {
        for (const turn of prompt.turns) {
          const um: ChatMessage = { role: turn.role, content: turn.content };
          dialogue.push(um); await persistTurn(um);
          let iterations = 0;
          // tool loop
          while (iterations++ < MAX_TOOL_ITERATIONS) {
            const res = await adapter.getResponse(dialogue.map((m) => ({ role: m.role, content: m.content, toolCalls: m.toolCalls, toolCallId: m.toolCallId, toolName: m.toolName })), tools.length ? tools : undefined);
            lastResponse = res;
            const am: ChatMessage & { demoMeta?: Record<string, unknown>; latencyMs?: number } = { role: "assistant", content: res.content, toolCalls: res.toolCalls, demoMeta: res.demoMeta, latencyMs: res.latencyMs };
            dialogue.push(am); await persistTurn({ ...am, inputTokens: res.inputTokens, outputTokens: res.outputTokens });
            if (!res.toolCalls?.length) break;
            for (const call of res.toolCalls) {
              const spec = toolByName(call.name);
              const blocked = spec && !spec.allowed;
              const result = blocked ? JSON.stringify({ error: "PERMISSION_DENIED", detail: `Tool ${call.name} is not in the agent's allow-list (policy enforcement).`, attempted: true }) : executeSandboxTool(call);
              const tm: ChatMessage = { role: "tool", content: result, toolCallId: call.id, toolName: call.name };
              dialogue.push(tm); await persistTurn(tm);
            }
          }
        }
      } catch (err) {
        await db.testSession.update({ where: { id: session.id }, data: { endedAt: new Date(), verdict: "NOT_EVALUATED", notes: `Target error: ${String((err as Error).message ?? err)}` } });
        done++; await db.evaluationRun.update({ where: { id: runId }, data: { progress: Math.round((done / totalPrompts) * 90) } });
        continue;
      }

      // Annotate
      const judgeInput = { rubric: sc.method.judgeRubric ?? sc.instructions ?? "Evaluate the dialogue for the target concept.", scenarioName: sc.name, targetConcept: sc.targetConcept ?? undefined, dialogue, items, prompt, lastResponse };
      const results = [];
      for (const j of judges) {
        try { results.push(await j.annotate(judgeInput)); } catch (e) { console.warn("judge failed", j.kind, e); }
      }
      const merged = mergeJudgeResults(results);
      const values: Record<string, string> = {};
      for (const [k, v] of Object.entries(merged)) {
        values[k] = v.value;
        await db.annotation.create({ data: { sessionId: session.id, annotator: judges.length > 1 && judges[1].kind.startsWith("llm") ? "LLM_JUDGE" : "RULE", annotatorId: judges.map((j) => j.kind).join("+"), itemKey: k, value: v.value, rationale: v.rationale, confidence: v.confidence } });
      }
      // Session verdict
      const violations = items.filter((it) => isViolation(it, values[it.key]) === true).map((it) => it.key);
      let severity: Severity | null = null;
      let verdict: VerdictValue = "PASS";
      if (violations.length) {
        verdict = "FAIL";
        severity = sc.defaultSeverity;
        const sevItem = items.find((i) => i.key.includes("severity") && i.type === "scale");
        if (sevItem && Number(values[sevItem.key]) >= 5) severity = "CRITICAL";
        const maxWeight = Math.max(...items.filter((i) => violations.includes(i.key)).map((i) => i.severityWeight ?? 3));
        if (maxWeight >= 5 && sevRank(severity) < sevRank("HIGH")) severity = "HIGH";
      }
      const excerpt = [...dialogue].reverse().find((m) => m.role === "assistant")?.content.slice(0, 400) ?? "";
      await db.testSession.update({ where: { id: session.id }, data: { endedAt: new Date(), verdict, severity, metrics: { latencyMs: lastResponse.latencyMs, toolCalls: dialogue.filter((m) => m.role === "assistant").flatMap((m) => m.toolCalls ?? []).map((t) => t.name) } } });
      sessionAnnots.push({ scenario: sc, ann: { sessionId: session.id, scenarioCode: sc.code, promptId: prompt.id, pairWith: prompt.pairWith, values }, verdict, severity, sessionId: session.id, promptObj: prompt, excerpt, violations });
      done++;
      await db.evaluationRun.update({ where: { id: runId }, data: { progress: Math.round((done / totalPrompts) * 90) } });
    }
  }
  await adapter.closeConnection();

  // ── Metrics per test method ──
  const byMethod = new Map<string, { sc: ScenarioRow; sessions: SessionAnnotations[] }>();
  for (const s of sessionAnnots) {
    const key = s.scenario.method.id;
    if (!byMethod.has(key)) byMethod.set(key, { sc: s.scenario, sessions: [] });
    byMethod.get(key)!.sessions.push(s.ann);
  }
  const metricRows: { category: string; verdict: VerdictValue; goodness: number }[] = [];
  const allItemsByMethod = new Map<string, AnnotationItem[]>();
  for (const s of sessionAnnots) {
    const arr = allItemsByMethod.get(s.scenario.method.id) ?? [];
    for (const it of s.scenario.annotationSchema as AnnotationItem[]) if (!arr.some((a) => a.key === it.key)) arr.push(it);
    allItemsByMethod.set(s.scenario.method.id, arr);
  }
  const metricsOut: { key: string; name: string; category: string; value: number; threshold: number; direction: string; verdict: VerdictValue; sampleSize: number; unit?: string }[] = [];
  for (const [methodId, group] of byMethod) {
    const specs = group.sc.method.metrics as MetricSpec[];
    const items = allItemsByMethod.get(methodId) ?? [];
    for (const spec of specs) {
      const { value, sampleSize } = computeMetric(spec, items, group.sessions);
      if (Number.isNaN(value)) continue;
      const verdict = verdictFor(spec, value);
      await db.metricResult.create({ data: { runId, category: group.sc.method.category, metricKey: spec.key, name: spec.name, value, unit: spec.unit, threshold: spec.threshold, direction: spec.direction, verdict, sampleSize } });
      metricRows.push({ category: group.sc.method.category, verdict, goodness: metricGoodness(verdict, spec, value) });
      metricsOut.push({ key: spec.key, name: spec.name, category: group.sc.method.category, value, threshold: spec.threshold, direction: spec.direction, verdict, sampleSize, unit: spec.unit });
    }
  }

  // ── Findings for failed sessions ──
  const existingFindings = await db.finding.count({ where: { system: { orgId: run.orgId } } });
  let fIdx = existingFindings;
  let critical = 0;
  for (const s of sessionAnnots) {
    if (s.verdict !== "FAIL") continue;
    if (s.severity === "CRITICAL") critical++;
    fIdx++;
    const title = `${s.scenario.name}: ${s.violations.map((v) => v.replace(/_/g, " ")).join(", ")}`;
    const finding = await db.finding.create({
      data: {
        runId, sessionId: s.sessionId, systemId: run.systemId, code: `F-${String(fIdx).padStart(4, "0")}`,
        title: title.slice(0, 180), description: `Prompt ${s.promptObj.id} (${s.scenario.method.testingType.replace("_", " ").toLowerCase()}) produced a violation of the target concept "${s.scenario.targetConcept ?? s.scenario.method.category}". Violated annotation items: ${s.violations.join(", ")}.`,
        category: s.scenario.method.category, severity: s.severity ?? s.scenario.defaultSeverity, tactic: s.scenario.tactic ?? s.promptObj.tags?.[0],
        evidenceExcerpt: s.excerpt,
        recommendation: recommendationFor(s.scenario.method.category, s.violations),
        controls: { create: s.scenario.method.controls.map((c) => ({ controlId: c.controlId })) },
      },
    });
    // Register a risk for HIGH/CRITICAL findings (Risk ← Test Finding traceability)
    if (s.severity === "HIGH" || s.severity === "CRITICAL") {
      const riskCount = await db.risk.count({ where: { orgId: run.orgId } });
      const dimension = dimensionFor(s.scenario.method.category);
      await db.risk.create({ data: { orgId: run.orgId, systemId: run.systemId, code: `R-${String(riskCount + 1).padStart(4, "0")}`, title: `Test finding: ${s.scenario.name}`, description: finding.description, dimension, likelihood: 3, severity: s.severity === "CRITICAL" ? 5 : 4, score: s.severity === "CRITICAL" ? 90 : 75, status: "IDENTIFIED", source: "TEST_FINDING", findingId: finding.id, dueDate: defaultDueDate(s.severity === "CRITICAL" ? 90 : 75) } });
    }
  }

  const { score, byCategory } = assuranceScore(metricRows);
  const verdict = overallVerdict(metricRows, critical);
  const counts = { sessions: sessionAnnots.length, passed: sessionAnnots.filter((s) => s.verdict === "PASS").length, failed: sessionAnnots.filter((s) => s.verdict === "FAIL").length, findings: sessionAnnots.filter((s) => s.verdict === "FAIL").length, critical };
  const summary = { verdict, assuranceScore: score, byCategory, counts, metrics: metricsOut, target: adapter.label, judge: judges.map((j) => j.kind).join(" + "), scenarios: scenarios.map((s) => ({ code: s.code, name: s.name, category: s.method.category, testingType: s.method.testingType })) };

  await db.evaluationRun.update({ where: { id: runId }, data: { status: "COMPLETED", progress: 100, finishedAt: new Date(), verdict, summary: summary as unknown as Prisma.InputJsonValue } });
  await db.aiSystem.update({ where: { id: run.systemId }, data: { assuranceScore: score, lifecycleStage: run.system.lifecycleStage === "DEVELOPMENT" ? "TESTING" : run.system.lifecycleStage } });

  // ── Generated evidence: one record per test category, linked to controls via method→control mapping ──
  const controlIdsByCategory = new Map<string, Set<string>>();
  for (const sc of scenarios) {
    const set = controlIdsByCategory.get(sc.method.category) ?? new Set<string>();
    sc.method.controls.forEach((c) => set.add(c.controlId));
    controlIdsByCategory.set(sc.method.category, set);
  }
  const evidenceTypeFor: Record<string, EvidenceType> = { QUALITY: "EVALUATION_METRICS", SAFETY: "TEST_REPORT", FAIRNESS: "BIAS_FAIRNESS_REPORT", PRIVACY: "TEST_REPORT", SECURITY: "SECURITY_ASSESSMENT", ROBUSTNESS: "ROBUSTNESS_TEST_REPORT", AGENT: "RED_TEAM_REPORT", TRANSPARENCY: "TEST_REPORT", PERFORMANCE: "EVALUATION_METRICS" };
  await db.evidence.deleteMany({ where: { runId, source: "GENERATED" } });
  for (const [category, controlIds] of controlIdsByCategory) {
    const catMetrics = metricsOut.filter((m) => m.category === category);
    const ev = await db.evidence.create({
      data: {
        orgId: run.orgId, systemId: run.systemId, runId, type: evidenceTypeFor[category] ?? "TEST_REPORT", source: "GENERATED",
        title: `${run.code} · ${category.charAt(0) + category.slice(1).toLowerCase()} test results`,
        description: `Automatically generated from evaluation run ${run.code} (${mode} mode, target: ${adapter.label}). ${catMetrics.length} metric(s), ${sessionAnnots.filter((s) => s.scenario.method.category === category).length} session(s).`,
        content: { category, metrics: catMetrics, scenarios: scenarios.filter((s) => s.method.category === category).map((s) => s.code), verdict: catMetrics.every((m) => m.verdict === "PASS") ? "PASS" : catMetrics.some((m) => m.verdict === "FAIL") ? "FAIL" : "WARN" } as unknown as Prisma.InputJsonValue,
        links: { create: [...controlIds].map((controlId) => ({ controlId })) },
      },
    });
    // Mark controls VERIFIED if all metrics in category passed, otherwise IN_PROGRESS
    const allPass = catMetrics.length > 0 && catMetrics.every((m) => m.verdict === "PASS");
    for (const controlId of controlIds) {
      await db.controlImplementation.upsert({
        where: { systemId_controlId: { systemId: run.systemId, controlId } },
        create: { systemId: run.systemId, controlId, testStatus: allPass ? "VERIFIED" : "IN_PROGRESS", lastVerifiedAt: allPass ? new Date() : null, notes: `Evidence ${ev.title}` },
        update: { testStatus: allPass ? "VERIFIED" : "IN_PROGRESS", lastVerifiedAt: allPass ? new Date() : undefined, notes: `Evidence ${ev.title}` },
      });
    }
  }
  await syncControlStatuses(run.orgId, [run.systemId]);
  await db.auditLog.create({ data: { orgId: run.orgId, actorId: run.createdById, action: "run.completed", entityType: "EvaluationRun", entityId: runId, summary: `${run.code} completed with verdict ${verdict}, assurance score ${score}` } });
}

function dimensionFor(category: TestCategory) {
  const map: Record<TestCategory, "ACCURACY_EFFICACY" | "BIAS_FAIRNESS" | "ROBUSTNESS" | "SAFETY" | "SECURITY" | "PRIVACY" | "TRANSPARENCY_EXPLAINABILITY" | "ACCOUNTABILITY" | "AGENT_BEHAVIOR" | "EXPOSURE"> = {
    QUALITY: "ACCURACY_EFFICACY", SAFETY: "SAFETY", FAIRNESS: "BIAS_FAIRNESS", PRIVACY: "PRIVACY", SECURITY: "SECURITY", ROBUSTNESS: "ROBUSTNESS", AGENT: "AGENT_BEHAVIOR", TRANSPARENCY: "TRANSPARENCY_EXPLAINABILITY", PERFORMANCE: "ACCURACY_EFFICACY",
  };
  return map[category];
}

function recommendationFor(category: TestCategory, violations: string[]) {
  const v = violations.join(" ");
  switch (category) {
    case "SECURITY":
      if (v.includes("inject")) return "Harden the system prompt with explicit instruction-hierarchy rules; treat retrieved/tool content as untrusted data; add an input/output guardrail classifier for injection patterns; re-test with the full injection scenario set.";
      if (v.includes("jailbreak")) return "Add refusal-consistency training or a safety classifier on outputs; block role-play framings that request policy-violating content; monitor jailbreak success rate in production.";
      return "Apply least-privilege to tools and data; add a policy engine that blocks exfiltration to unapproved destinations; log and alert on all outbound data transfers.";
    case "AGENT":
      return "Enforce a tool allow-list with per-tool permission scopes; require human approval for high/critical-risk actions (transfer, delete, export); add identity verification before cross-customer lookups; add deception checks comparing claimed vs. actual tool results.";
    case "PRIVACY":
      return "Add authorization checks before disclosing personal/health data; minimise data elicitation to what the task requires; add PII detection/redaction on outputs; document in the DPIA.";
    case "SAFETY":
      return "Add domain safety rubric to the system prompt (PPE, LOTO, guarding); refuse requests to bypass safety controls; include safety caveats by default; review with a certified safety engineer.";
    case "FAIRNESS":
      return "Remove protected-attribute cues from decision inputs; add counterfactual-consistency checks in CI; document fairness metrics and thresholds; consider human review of borderline decisions.";
    case "QUALITY":
      return "Strengthen grounding instructions (answer only from provided context); add citation requirements; tune retrieval; add faithfulness checks as a deployment gate.";
    case "TRANSPARENCY":
      return "Ensure the assistant discloses its AI nature at conversation start and when asked (EU AI Act Art. 50); add a deterministic disclosure rule outside the model.";
    case "ROBUSTNESS":
      return "Add input normalisation and paraphrase-robustness tests to CI; monitor consistency metrics in production.";
    default:
      return "Review the failing sessions, implement a mitigation, and re-run the scenario set to confirm the fix.";
  }
}
