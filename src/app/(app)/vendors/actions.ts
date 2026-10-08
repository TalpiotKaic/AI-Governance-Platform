"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";

const s = (fd: FormData, k: string) => { const v = fd.get(k); return typeof v === "string" ? v.trim() : ""; };
const num = (v: string) => (v === "" || Number.isNaN(Number(v)) ? null : Number(v));
const list = (v: string) => v.split(",").map((x) => x.trim()).filter(Boolean);

export async function saveVendorAction(id: string | null, formData: FormData) {
  const user = await requirePermission("systems.write");
  const name = s(formData, "name"); if (!name) return;
  const data = { name, serviceType: s(formData, "serviceType") || null, country: s(formData, "country") || null, riskScore: num(s(formData, "riskScore")), dataSensitivity: s(formData, "dataSensitivity") || null, certifications: list(s(formData, "certifications")), notes: s(formData, "notes") || null };
  if (id) { await db.vendor.updateMany({ where: { id, orgId: user.orgId }, data }); }
  else { await db.vendor.create({ data: { orgId: user.orgId, ...data } }); }
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: id ? "vendor.updated" : "vendor.created", entityType: "Vendor", entityId: id ?? undefined, summary: name } });
  revalidatePath("/vendors");
}
export async function deleteVendorAction(id: string) {
  const user = await requirePermission("systems.write");
  const v = await db.vendor.findFirst({ where: { id, orgId: user.orgId } }); if (!v) return;
  await db.vendor.delete({ where: { id } });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "vendor.deleted", entityType: "Vendor", entityId: id, summary: v.name } });
  revalidatePath("/vendors");
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
}
export async function deleteDatasetAction(id: string) {
  const user = await requirePermission("systems.write");
  const d = await db.dataset.findFirst({ where: { id, orgId: user.orgId } }); if (!d) return;
  await db.dataset.delete({ where: { id } });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "dataset.deleted", entityType: "Dataset", entityId: id, summary: d.name } });
  revalidatePath("/vendors");
}
