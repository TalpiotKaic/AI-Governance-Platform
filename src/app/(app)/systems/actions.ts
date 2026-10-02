"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { nextCode, riskScore } from "@/lib/utils";
import { intakeTier } from "@/lib/intake";
import type { Prisma } from "@/generated/prisma/client";

const systemSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(["PREDICTIVE_ML", "LLM_APPLICATION", "RAG_ASSISTANT", "AGENT", "MULTI_AGENT", "EXTERNAL_SAAS"]),
  sector: z.string().optional(),
  purpose: z.string().optional(),
  deploymentContext: z.string().optional(),
  lifecycleStage: z.enum(["PLANNED", "DEVELOPMENT", "TESTING", "APPROVED", "PRODUCTION", "RETIRED"]),
  euAiActCategory: z.enum(["UNCLASSIFIED", "MINIMAL", "LIMITED_TRANSPARENCY", "HIGH_RISK", "PROHIBITED", "GPAI", "GPAI_SYSTEMIC"]),
  euAiActAnnexIIIArea: z.string().optional(),
  intendedUsers: z.string().optional(),
  affectedPersons: z.string().optional(),
  humanOversight: z.string().optional(),
  usesPersonalData: z.boolean(),
  usesSensitiveData: z.boolean(),
  customerFacing: z.boolean(),
  automatedDecision: z.boolean(),
  geographies: z.string().optional(),
  tags: z.string().optional(),
  modelProvider: z.string().optional(),
  modelName: z.string().optional(),
  modelVersion: z.string().optional(),
  // agent profile
  agentFramework: z.string().optional(),
  autonomyLevel: z.enum(["ASSISTIVE", "SUPERVISED", "AUTONOMOUS"]).optional(),
  tools: z.string().optional(), // one per line: name|riskLevel|allowed
  dataSources: z.string().optional(),
  mcpServers: z.string().optional(),
  killSwitch: z.boolean().optional(),
  maxBudgetUsd: z.string().optional(),
});

function parseForm(fd: FormData) {
  const b = (k: string) => fd.get(k) === "on" || fd.get(k) === "true";
  const s = (k: string) => { const v = fd.get(k); return typeof v === "string" ? v.trim() : undefined; };
  return systemSchema.parse({
    name: s("name"), description: s("description"), type: s("type"), sector: s("sector"), purpose: s("purpose"), deploymentContext: s("deploymentContext"), lifecycleStage: s("lifecycleStage"), euAiActCategory: s("euAiActCategory"), euAiActAnnexIIIArea: s("euAiActAnnexIIIArea"), intendedUsers: s("intendedUsers"), affectedPersons: s("affectedPersons"), humanOversight: s("humanOversight"),
    usesPersonalData: b("usesPersonalData"), usesSensitiveData: b("usesSensitiveData"), customerFacing: b("customerFacing"), automatedDecision: b("automatedDecision"), geographies: s("geographies"), tags: s("tags"),
    modelProvider: s("modelProvider"), modelName: s("modelName"), modelVersion: s("modelVersion"),
    agentFramework: s("agentFramework"), autonomyLevel: s("autonomyLevel") || undefined, tools: s("tools"), dataSources: s("dataSources"), mcpServers: s("mcpServers"), killSwitch: b("killSwitch"), maxBudgetUsd: s("maxBudgetUsd"),
  });
}

function csv(v?: string) { return (v ?? "").split(",").map((x) => x.trim()).filter(Boolean); }
function parseTools(v?: string) {
  return (v ?? "").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => { const [name, riskLevel = "medium", allowed = "true", permissions = ""] = l.split("|").map((x) => x.trim()); return { name, riskLevel, allowed: allowed !== "false", permissions: csv(permissions) }; });
}
function parseLines(v?: string, key = "name") { return (v ?? "").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => ({ [key]: l })); }

export async function createSystemAction(formData: FormData) {
  const user = await requirePermission("systems.write");
  const d = parseForm(formData);
  const count = await db.aiSystem.count({ where: { orgId: user.orgId } });
  const { score, tier } = intakeTier(d);
  const isAgent = d.type === "AGENT" || d.type === "MULTI_AGENT";
  const system = await db.aiSystem.create({ data: {
    orgId: user.orgId, code: nextCode("AIS", count), name: d.name, description: d.description, type: d.type, sector: d.sector, purpose: d.purpose, deploymentContext: d.deploymentContext, lifecycleStage: d.lifecycleStage, euAiActCategory: d.euAiActCategory, euAiActAnnexIIIArea: d.euAiActAnnexIIIArea, intendedUsers: d.intendedUsers, affectedPersons: d.affectedPersons, humanOversight: d.humanOversight, usesPersonalData: d.usesPersonalData, usesSensitiveData: d.usesSensitiveData, customerFacing: d.customerFacing, automatedDecision: d.automatedDecision, geographies: csv(d.geographies), tags: csv(d.tags), riskTier: tier, riskScore: score, ownerId: user.id,
    models: d.modelName ? { create: { orgId: user.orgId, provider: d.modelProvider ?? "Unknown", name: d.modelName, version: d.modelVersion } } : undefined,
    agentProfile: isAgent ? { create: { framework: d.agentFramework, autonomyLevel: d.autonomyLevel ?? "SUPERVISED", tools: parseTools(d.tools) as unknown as Prisma.InputJsonValue, dataSources: parseLines(d.dataSources) as unknown as Prisma.InputJsonValue, mcpServers: parseLines(d.mcpServers) as unknown as Prisma.InputJsonValue, killSwitch: d.killSwitch ?? false, maxBudgetUsd: d.maxBudgetUsd ? Number(d.maxBudgetUsd) : undefined } } : undefined,
  } });
  // Intake-generated risks (context-aware): seeds the register so the Risk → Control → Test chain starts immediately
  const seeds: { title: string; dimension: Prisma.RiskCreateInput["dimension"]; l: number; s: number; when: boolean }[] = [
    { title: "Inaccurate or hallucinated outputs in the intended context", dimension: "ACCURACY_EFFICACY", l: 3, s: 3, when: d.type !== "PREDICTIVE_ML" },
    { title: "Disparate treatment of protected groups", dimension: "BIAS_FAIRNESS", l: 3, s: d.euAiActCategory === "HIGH_RISK" ? 5 : 3, when: d.automatedDecision || d.euAiActCategory === "HIGH_RISK" },
    { title: "Unauthorised disclosure of personal / sensitive data", dimension: "PRIVACY", l: 3, s: d.usesSensitiveData ? 5 : 4, when: d.usesPersonalData },
    { title: "Prompt injection / jailbreak leading to policy violation", dimension: "SECURITY", l: 3, s: 4, when: d.type !== "PREDICTIVE_ML" },
    { title: "Agent executes unsafe or unauthorised actions via tools", dimension: "AGENT_BEHAVIOR", l: 3, s: 5, when: isAgent },
    { title: "Users not informed they are interacting with AI (Art. 50 / 제31조)", dimension: "TRANSPARENCY_EXPLAINABILITY", l: 2, s: 3, when: d.customerFacing },
  ];
  let rc = await db.risk.count({ where: { orgId: user.orgId } });
  for (const r of seeds.filter((x) => x.when)) {
    rc++;
    await db.risk.create({ data: { orgId: user.orgId, systemId: system.id, code: nextCode("R", rc - 1), title: r.title, dimension: r.dimension, likelihood: r.l, severity: r.s, score: riskScore(r.l, r.s), status: "IDENTIFIED", source: "INTAKE", ownerId: user.id } });
  }
  // Approval workflow by tier
  const stages = tier === "LOW" ? ["Governance owner approval"] : tier === "MEDIUM" ? ["Technical review", "Governance owner approval"] : ["Technical review", "Privacy & security review", "Legal / compliance review", "Executive approval"];
  await db.approval.createMany({ data: stages.map((stage) => ({ orgId: user.orgId, subjectType: "SYSTEM_DEPLOYMENT" as const, subjectId: system.id, subjectLabel: `${system.code} ${system.name} — deployment`, stage })) });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "system.created", entityType: "AiSystem", entityId: system.id, summary: `${system.code} ${system.name} registered (tier ${tier})` } });
  revalidatePath("/systems");
  redirect(`/systems/${system.id}`);
}

export async function updateSystemAction(id: string, formData: FormData) {
  const user = await requirePermission("systems.write");
  const d = parseForm(formData);
  const existing = await db.aiSystem.findFirstOrThrow({ where: { id, orgId: user.orgId }, include: { agentProfile: true } });
  const { score, tier } = intakeTier(d);
  const isAgent = d.type === "AGENT" || d.type === "MULTI_AGENT";
  await db.aiSystem.update({ where: { id }, data: {
    name: d.name, description: d.description, type: d.type, sector: d.sector, purpose: d.purpose, deploymentContext: d.deploymentContext, lifecycleStage: d.lifecycleStage, euAiActCategory: d.euAiActCategory, euAiActAnnexIIIArea: d.euAiActAnnexIIIArea, intendedUsers: d.intendedUsers, affectedPersons: d.affectedPersons, humanOversight: d.humanOversight, usesPersonalData: d.usesPersonalData, usesSensitiveData: d.usesSensitiveData, customerFacing: d.customerFacing, automatedDecision: d.automatedDecision, geographies: csv(d.geographies), tags: csv(d.tags), riskTier: tier, riskScore: score,
    agentProfile: isAgent ? { upsert: { create: { framework: d.agentFramework, autonomyLevel: d.autonomyLevel ?? "SUPERVISED", tools: parseTools(d.tools) as unknown as Prisma.InputJsonValue, dataSources: parseLines(d.dataSources) as unknown as Prisma.InputJsonValue, mcpServers: parseLines(d.mcpServers) as unknown as Prisma.InputJsonValue, killSwitch: d.killSwitch ?? false, maxBudgetUsd: d.maxBudgetUsd ? Number(d.maxBudgetUsd) : undefined }, update: { framework: d.agentFramework, autonomyLevel: d.autonomyLevel ?? "SUPERVISED", tools: parseTools(d.tools) as unknown as Prisma.InputJsonValue, dataSources: parseLines(d.dataSources) as unknown as Prisma.InputJsonValue, mcpServers: parseLines(d.mcpServers) as unknown as Prisma.InputJsonValue, killSwitch: d.killSwitch ?? false, maxBudgetUsd: d.maxBudgetUsd ? Number(d.maxBudgetUsd) : null } } } : undefined,
  } });
  // Change detection → re-test trigger
  const changes: { type: "TOOL" | "CONFIGURATION"; description: string; cats: ("AGENT" | "SECURITY" | "PRIVACY" | "QUALITY")[] }[] = [];
  if (isAgent && existing.agentProfile && JSON.stringify(existing.agentProfile.tools) !== JSON.stringify(parseTools(d.tools))) changes.push({ type: "TOOL", description: "Agent tool set changed", cats: ["AGENT", "SECURITY"] });
  if (existing.type !== d.type || existing.euAiActCategory !== d.euAiActCategory) changes.push({ type: "CONFIGURATION", description: `Classification changed (${existing.euAiActCategory} → ${d.euAiActCategory})`, cats: ["QUALITY", "PRIVACY", "SECURITY"] });
  for (const c of changes) await db.changeEvent.create({ data: { systemId: id, type: c.type, description: c.description, requiresRetest: true, retestCategories: c.cats } });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "system.updated", entityType: "AiSystem", entityId: id, summary: `${existing.code} updated` } });
  revalidatePath(`/systems/${id}`);
  redirect(`/systems/${id}`);
}

export async function recordChangeAction(systemId: string, formData: FormData) {
  const user = await requirePermission("systems.write");
  await db.aiSystem.findFirstOrThrow({ where: { id: systemId, orgId: user.orgId } });
  const type = String(formData.get("type")) as "MODEL_VERSION" | "PROMPT" | "TOOL" | "DATA_SOURCE" | "CONFIGURATION" | "VENDOR";
  const description = String(formData.get("description") ?? "").trim();
  const catsMap: Record<string, ("QUALITY" | "SAFETY" | "FAIRNESS" | "PRIVACY" | "SECURITY" | "ROBUSTNESS" | "AGENT" | "TRANSPARENCY" | "PERFORMANCE")[]> = { MODEL_VERSION: ["QUALITY", "SAFETY", "FAIRNESS", "SECURITY", "ROBUSTNESS"], PROMPT: ["QUALITY", "SECURITY", "TRANSPARENCY"], TOOL: ["AGENT", "SECURITY"], DATA_SOURCE: ["QUALITY", "PRIVACY", "FAIRNESS"], CONFIGURATION: ["SECURITY", "PERFORMANCE"], VENDOR: ["SECURITY", "PRIVACY"] };
  await db.changeEvent.create({ data: { systemId, type, description: description || `${type} changed`, requiresRetest: true, retestCategories: catsMap[type] ?? [] } });
  // invalidate generated evidence of affected categories? mark as EXPIRED for test-derived evidence
  await db.evidence.updateMany({ where: { systemId, source: "GENERATED", type: { in: ["EVALUATION_METRICS", "TEST_REPORT", "SECURITY_ASSESSMENT", "RED_TEAM_REPORT", "BIAS_FAIRNESS_REPORT", "ROBUSTNESS_TEST_REPORT"] }, status: "VALID" }, data: { status: "EXPIRED" } });
  await db.controlImplementation.updateMany({ where: { systemId, status: "VERIFIED" }, data: { status: "IN_PROGRESS", notes: `Re-test required after change: ${description || type}` } });
  await db.task.create({ data: { orgId: user.orgId, title: `Re-evaluate after change: ${description || type}`, description: `Categories to re-test: ${(catsMap[type] ?? []).join(", ")}`, assigneeId: user.id, status: "OPEN", relatedType: "system", relatedId: systemId, dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14) } });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "system.change_recorded", entityType: "AiSystem", entityId: systemId, summary: `${type}: ${description}` } });
  revalidatePath(`/systems/${systemId}`);
}

export async function updateControlStatusAction(systemId: string, controlId: string, formData: FormData) {
  const user = await requirePermission("systems.write");
  await db.aiSystem.findFirstOrThrow({ where: { id: systemId, orgId: user.orgId } });
  const status = String(formData.get("status")) as "NOT_STARTED" | "IN_PROGRESS" | "IMPLEMENTED" | "VERIFIED" | "NOT_APPLICABLE";
  const notes = String(formData.get("notes") ?? "").trim() || undefined;
  await db.controlImplementation.upsert({ where: { systemId_controlId: { systemId, controlId } }, create: { systemId, controlId, status, notes, ownerId: user.id }, update: { status, notes, ownerId: user.id } });
  revalidatePath(`/systems/${systemId}`);
}

export async function deleteSystemAction(id: string) {
  const user = await requirePermission("systems.delete");
  const s = await db.aiSystem.findFirstOrThrow({ where: { id, orgId: user.orgId } });
  await db.aiSystem.delete({ where: { id } });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "system.deleted", entityType: "AiSystem", entityId: id, summary: `${s.code} deleted` } });
  revalidatePath("/systems");
  redirect("/systems");
}

