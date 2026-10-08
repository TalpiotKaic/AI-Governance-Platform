"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { ASSESSMENT_ITEMS, computeVendorRisk, dataProfileSummary, type AssessmentScores, type VendorAssessment, type VendorDataProfile } from "@/lib/vendors/assessment";
import { ensureVendorRisks } from "@/lib/vendors/risk";
import type { Prisma } from "@/generated/prisma/client";

const s = (fd: FormData, k: string) => { const v = fd.get(k); return typeof v === "string" ? v.trim() : ""; };
const num = (v: string) => (v === "" || Number.isNaN(Number(v)) ? null : Number(v));
const list = (v: string) => v.split(",").map((x) => x.trim()).filter(Boolean);

export async function saveVendorAction(id: string | null, formData: FormData) {
  const user = await requirePermission("systems.write");
  const name = s(formData, "name"); if (!name) return;
  // structured data-sensitivity profile
  const profile: VendorDataProfile = { dataTypes: formData.getAll("dataTypes").map(String), personalData: formData.get("personalData") === "on", sensitiveData: formData.get("sensitiveData") === "on", conditions: formData.getAll("conditions").map(String), note: s(formData, "dataNote") || null };
  const hasProfile = profile.dataTypes.length > 0 || profile.personalData || profile.sensitiveData || profile.conditions.length > 0 || !!profile.note;
  // six-item due-diligence assessment → score
  const scores: AssessmentScores = {};
  for (const item of ASSESSMENT_ITEMS) { const v = s(formData, `score:${item.key}`); if (v !== "") scores[item.key] = Number(v) as 0 | 1 | 2 | 3; }
  const computed = computeVendorRisk(scores);
  const manual = num(s(formData, "riskScore"));
  const existing = id ? await db.vendor.findFirst({ where: { id, orgId: user.orgId } }) : null;
  const assessment: VendorAssessment | null = computed !== null ? { scores, note: s(formData, "assessmentNote") || null, assessedAt: new Date().toISOString(), assessedBy: user.name } : null;
  const data = {
    name, serviceType: s(formData, "serviceType") || null, country: s(formData, "country") || null,
    riskScore: computed ?? manual, dataSensitivity: hasProfile ? dataProfileSummary(profile) : (s(formData, "dataSensitivity") || null),
    certifications: list(s(formData, "certifications")), notes: s(formData, "notes") || null,
    dataProfile: hasProfile ? (profile as unknown as Prisma.InputJsonValue) : undefined,
    assessment: assessment ? (assessment as unknown as Prisma.InputJsonValue) : undefined, assessedAt: assessment ? new Date() : undefined,
  };
  const vendor = id ? (await db.vendor.update({ where: { id }, data })) : await db.vendor.create({ data: { orgId: user.orgId, ...data } });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: id ? "vendor.updated" : "vendor.created", entityType: "Vendor", entityId: vendor.id, summary: `${name}${computed !== null ? ` · risk ${computed}/100` : ""}` } });
  // Due-diligence evidence (EV-SUP → HC-15): one VALID record per vendor, earlier ones superseded
  const assessmentChanged = assessment && JSON.stringify((existing?.assessment as VendorAssessment | null)?.scores ?? null) !== JSON.stringify(scores);
  if (assessment && (assessmentChanged || !existing)) {
    const hc15 = await db.control.findUnique({ where: { code: "HC-15" } });
    await db.evidence.updateMany({ where: { orgId: user.orgId, type: "VENDOR_ASSESSMENT", status: "VALID", content: { path: ["vendorId"], equals: vendor.id } }, data: { status: "SUPERSEDED" } });
    await db.evidence.create({ data: {
      orgId: user.orgId, type: "VENDOR_ASSESSMENT", source: "ATTESTATION", status: "VALID", title: `Vendor due diligence · ${name} · ${computed}/100`,
      description: `Six-item due-diligence assessment (${ASSESSMENT_ITEMS.map((i) => `${i.key}=${scores[i.key] ?? "—"}`).join(", ")}). ${data.dataSensitivity ? `Data exposed: ${data.dataSensitivity}.` : ""}`.trim(),
      content: { vendorId: vendor.id, vendorName: name, score: computed, scores, dataProfile: hasProfile ? profile : null, assessedAt: assessment.assessedAt, assessedBy: user.name } as unknown as Prisma.InputJsonValue,
      createdById: user.id, validFrom: new Date(), validUntil: new Date(Date.now() + 365 * 24 * 3600 * 1000),
      links: hc15 ? { create: [{ controlId: hc15.id }] } : undefined,
    } });
  }
  // High-risk vendor on high-risk systems → risk register
  const risks = await ensureVendorRisks(user.orgId, { vendorId: vendor.id });
  if (risks.length) await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "risk.auto_registered", entityType: "Vendor", entityId: vendor.id, summary: `${risks.join(", ")} registered for high-risk vendor ${name}` } });
  revalidatePath("/vendors"); revalidatePath("/risks"); revalidatePath("/evidence");
  redirect("/vendors?tab=vendors");
}

export async function deleteVendorAction(id: string) {
  const user = await requirePermission("systems.write");
  const v = await db.vendor.findFirst({ where: { id, orgId: user.orgId } }); if (!v) return;
  await db.vendor.delete({ where: { id } });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "vendor.deleted", entityType: "Vendor", entityId: id, summary: v.name } });
  revalidatePath("/vendors");
  redirect("/vendors?tab=vendors");
}
export async function saveDatasetAction(id: string | null, formData: FormData) {
  const user = await requirePermission("systems.write");
  const name = s(formData, "name"); if (!name) return;
  const rc = num(s(formData, "recordCount"));
  const data = { name, version: s(formData, "version") || null, source: s(formData, "source") || null, description: s(formData, "description") || null, containsPii: formData.get("containsPii") === "on", sensitivity: s(formData, "sensitivity") || null, recordCount: rc === null ? null : Math.round(rc) };
  if (id) { await db.dataset.updateMany({ where: { id, orgId: user.orgId }, data }); }
  else { await db.dataset.create({ data: { orgId: user.orgId, ...data } }); }
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: id ? "dataset.updated" : "dataset.created", entityType: "Dataset", entityId: id ?? undefined, summary: name } });
  revalidatePath("/vendors");
  redirect("/vendors?tab=datasets");
}
export async function deleteDatasetAction(id: string) {
  const user = await requirePermission("systems.write");
  const d = await db.dataset.findFirst({ where: { id, orgId: user.orgId } }); if (!d) return;
  await db.dataset.delete({ where: { id } });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "dataset.deleted", entityType: "Dataset", entityId: id, summary: d.name } });
  revalidatePath("/vendors");
  redirect("/vendors?tab=datasets");
}
