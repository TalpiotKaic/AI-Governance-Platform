"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { intakeTier } from "@/lib/intake";
import { createSystemRecord, csv, parseLines, parseTools, systemSchema } from "@/lib/systems/create";
import { linksFromForm, syncSystemLinks } from "@/lib/systems/links";
import type { Prisma } from "@/generated/prisma/client";


function parseForm(fd: FormData) {
  const b = (k: string) => fd.get(k) === "on" || fd.get(k) === "true";
  const s = (k: string) => { const v = fd.get(k); return typeof v === "string" ? v.trim() : undefined; };
  return systemSchema.parse({
    name: s("name"), description: s("description"), type: s("type"), sector: s("sector"), purpose: s("purpose"), deploymentContext: s("deploymentContext"), lifecycleStage: s("lifecycleStage"), euAiActCategory: s("euAiActCategory"), euAiActAnnexIIIArea: s("euAiActAnnexIIIArea"), intendedUsers: s("intendedUsers"), affectedPersons: s("affectedPersons"), humanOversight: s("humanOversight"),
    usesPersonalData: b("usesPersonalData"), usesSensitiveData: b("usesSensitiveData"), customerFacing: b("customerFacing"), automatedDecision: b("automatedDecision"), geographies: s("geographies"), tags: s("tags"),
    modelProvider: s("modelProvider"), modelName: s("modelName"), modelVersion: s("modelVersion"),
    agentFramework: s("agentFramework"), autonomyLevel: s("autonomyLevel") || undefined, tools: s("tools"), dataSources: s("dataSources"), mcpServers: s("mcpServers"), killSwitch: b("killSwitch"), maxBudgetUsd: s("maxBudgetUsd"),
    vendors: s("newVendors"), datasets: s("newDatasets"), linkProviderVendor: fd.has("linkProviderVendor") ? b("linkProviderVendor") : undefined,
  });
}

export async function createSystemAction(formData: FormData) {
  const user = await requirePermission("systems.write");
  const d = parseForm(formData);
  const { system } = await createSystemRecord(user, d, { links: linksFromForm(formData, d) });
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
  const changes: { type: "TOOL" | "CONFIGURATION" | "VENDOR"; description: string; cats: ("AGENT" | "SECURITY" | "PRIVACY" | "QUALITY")[] }[] = [];
  if (isAgent && existing.agentProfile && JSON.stringify(existing.agentProfile.tools) !== JSON.stringify(parseTools(d.tools))) changes.push({ type: "TOOL", description: "Agent tool set changed", cats: ["AGENT", "SECURITY"] });
  if (existing.type !== d.type || existing.euAiActCategory !== d.euAiActCategory) changes.push({ type: "CONFIGURATION", description: `Classification changed (${existing.euAiActCategory} → ${d.euAiActCategory})`, cats: ["QUALITY", "PRIVACY", "SECURITY"] });
  const { vendorsChanged } = await syncSystemLinks(user.orgId, id, linksFromForm(formData, { ...d, linkProviderVendor: d.linkProviderVendor ?? false }), { replace: true });
  if (vendorsChanged) changes.push({ type: "VENDOR", description: "Vendor set changed", cats: ["SECURITY", "PRIVACY"] });
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


/* ── Vendor / dataset links from the system detail page ── */
export async function linkVendorAction(systemId: string, formData: FormData) {
  const user = await requirePermission("systems.write");
  const system = await db.aiSystem.findFirstOrThrow({ where: { id: systemId, orgId: user.orgId } });
  const vendorId = String(formData.get("vendorId") || ""); const name = String(formData.get("vendorName") || "").trim();
  if (!vendorId && !name) return;
  const { vendorsChanged } = await syncSystemLinks(user.orgId, systemId, { vendors: [{ id: vendorId || undefined, name: name || undefined, role: String(formData.get("role") || "") || null, serviceType: String(formData.get("serviceType") || "") || null }], datasets: [] });
  if (vendorsChanged) await db.changeEvent.create({ data: { systemId, type: "VENDOR", description: `Vendor linked: ${name || vendorId}`, requiresRetest: true, retestCategories: ["SECURITY", "PRIVACY"] } });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "system.vendor_linked", entityType: "AiSystem", entityId: systemId, summary: `${system.code}: vendor ${name || vendorId}` } });
  revalidatePath(`/systems/${systemId}`);
}
export async function unlinkVendorAction(systemId: string, vendorId: string) {
  const user = await requirePermission("systems.write");
  const system = await db.aiSystem.findFirstOrThrow({ where: { id: systemId, orgId: user.orgId } });
  await db.systemVendor.deleteMany({ where: { systemId, vendorId } });
  await db.changeEvent.create({ data: { systemId, type: "VENDOR", description: "Vendor unlinked", requiresRetest: true, retestCategories: ["SECURITY", "PRIVACY"] } });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "system.vendor_unlinked", entityType: "AiSystem", entityId: systemId, summary: `${system.code}: vendor removed` } });
  revalidatePath(`/systems/${systemId}`);
}
export async function linkDatasetAction(systemId: string, formData: FormData) {
  const user = await requirePermission("systems.write");
  const system = await db.aiSystem.findFirstOrThrow({ where: { id: systemId, orgId: user.orgId } });
  const datasetId = String(formData.get("datasetId") || ""); const name = String(formData.get("datasetName") || "").trim();
  if (!datasetId && !name) return;
  await syncSystemLinks(user.orgId, systemId, { vendors: [], datasets: [{ id: datasetId || undefined, name: name || undefined, purpose: String(formData.get("purpose") || "") || null, containsPii: formData.get("containsPii") === "on", sensitivity: String(formData.get("sensitivity") || "") || null }] });
  await db.changeEvent.create({ data: { systemId, type: "DATA_SOURCE", description: `Dataset linked: ${name || datasetId}`, requiresRetest: true, retestCategories: ["QUALITY", "PRIVACY"] } });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "system.dataset_linked", entityType: "AiSystem", entityId: systemId, summary: `${system.code}: dataset ${name || datasetId}` } });
  revalidatePath(`/systems/${systemId}`);
}
export async function unlinkDatasetAction(systemId: string, datasetId: string) {
  const user = await requirePermission("systems.write");
  const system = await db.aiSystem.findFirstOrThrow({ where: { id: systemId, orgId: user.orgId } });
  await db.systemDataset.deleteMany({ where: { systemId, datasetId } });
  await db.changeEvent.create({ data: { systemId, type: "DATA_SOURCE", description: "Dataset unlinked", requiresRetest: true, retestCategories: ["QUALITY", "PRIVACY"] } });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "system.dataset_unlinked", entityType: "AiSystem", entityId: systemId, summary: `${system.code}: dataset removed` } });
  revalidatePath(`/systems/${systemId}`);
}
