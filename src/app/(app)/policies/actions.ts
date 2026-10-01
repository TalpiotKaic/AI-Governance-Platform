"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function createPolicyAction(formData: FormData) {
  const user = await requireRole("GOVERNANCE_OWNER");
  const p = await db.policy.create({ data: { orgId: user.orgId, title: String(formData.get("title")), version: String(formData.get("version") || "1.0"), content: String(formData.get("content") ?? "") || null, status: "DRAFT", ownerId: user.id } });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "policy.created", entityType: "Policy", entityId: p.id, summary: p.title } });
  revalidatePath("/policies");
}

export async function setPolicyStatusAction(id: string, status: "DRAFT" | "ACTIVE" | "RETIRED") {
  const user = await requireRole("GOVERNANCE_OWNER");
  const p = await db.policy.findFirstOrThrow({ where: { id, orgId: user.orgId } });
  await db.policy.update({ where: { id }, data: { status, effectiveDate: status === "ACTIVE" ? new Date() : p.effectiveDate } });
  if (status === "ACTIVE") {
    const ev = await db.evidence.create({ data: { orgId: user.orgId, type: "POLICY_DOCUMENT", source: "GENERATED", title: `${p.title} v${p.version} (activated)`, description: p.content?.slice(0, 300) ?? undefined, createdById: user.id } });
    const hc01 = await db.control.findUnique({ where: { code: "HC-01" } });
    if (hc01) await db.evidenceLink.create({ data: { evidenceId: ev.id, controlId: hc01.id } });
  }
  revalidatePath("/policies");
}
