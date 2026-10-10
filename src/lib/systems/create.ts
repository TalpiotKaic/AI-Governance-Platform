import { db } from "@/lib/db";
import { recommendedMitigation } from "@/lib/risks/mitigations";
import { nextCode, riskScore } from "@/lib/utils";
import { intakeTier } from "@/lib/intake";
import { defaultDueDate } from "@/lib/risks/due";
import type { SessionUser } from "@/lib/auth";
import type { Prisma } from "@/generated/prisma/client";
import { z } from "zod";
import { linksFromForm, syncSystemLinks, type LinkSpec } from "./links";
import { syncControlStatuses } from "@/lib/controls/status";

/** Intake form schema — shared by the single-system form and the Excel bulk import. */
export const systemSchema = z.object({
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
  // third parties & data (one per line: "name | role | serviceType | country" / "name | purpose | PII | sensitivity")
  vendors: z.string().optional(),
  datasets: z.string().optional(),
  linkProviderVendor: z.boolean().optional(),
});

export type SystemInput = z.infer<typeof systemSchema>;

export function csv(v?: string) { return (v ?? "").split(",").map((x) => x.trim()).filter(Boolean); }
export function parseTools(v?: string) {
  return (v ?? "").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => { const [name, riskLevel = "medium", allowed = "true", permissions = ""] = l.split("|").map((x) => x.trim()); return { name, riskLevel, allowed: allowed !== "false", permissions: csv(permissions) }; });
}
export function parseLines(v?: string, key = "name") { return (v ?? "").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => ({ [key]: l })); }


/** Creates the system plus its intake-seeded risks and tier-based approval workflow; returns the created record and tier. */
export async function createSystemRecord(user: SessionUser, d: SystemInput, opts: { source?: string; links?: LinkSpec } = {}) {
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
    await db.risk.create({ data: { orgId: user.orgId, systemId: system.id, code: nextCode("R", rc - 1), title: r.title, dimension: r.dimension, likelihood: r.l, severity: r.s, score: riskScore(r.l, r.s), status: "IDENTIFIED", source: "INTAKE", ownerId: user.id, mitigation: recommendedMitigation(r.dimension), dueDate: defaultDueDate(riskScore(r.l, r.s)) } });
  }
  // Approval workflow by tier
  const stages = tier === "LOW" ? ["Governance owner approval"] : tier === "MEDIUM" ? ["Technical review", "Governance owner approval"] : ["Technical review", "Privacy & security review", "Legal / compliance review", "Executive approval"];
  await db.approval.createMany({ data: stages.map((stage) => ({ orgId: user.orgId, subjectType: "SYSTEM_DEPLOYMENT" as const, subjectId: system.id, subjectLabel: `${system.code} ${system.name} — deployment`, stage })) });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "system.created", entityType: "AiSystem", entityId: system.id, summary: `${system.code} ${system.name} registered (tier ${tier})${opts.source ? ` via ${opts.source}` : ""}` } });
  // Vendors & datasets (existing by id/name, or created on the fly); the model provider becomes a vendor unless opted out
  const links = opts.links ?? linksFromForm(new FormData(), d);
  await syncSystemLinks(user.orgId, system.id, links);
  await syncControlStatuses(user.orgId, [system.id]);
  return { system, tier, score };
}
