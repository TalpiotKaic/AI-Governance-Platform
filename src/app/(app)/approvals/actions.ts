"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function decideApprovalAction(id: string, formData: FormData) {
  const user = await requireRole("REVIEWER");
  const a = await db.approval.findFirstOrThrow({ where: { id, orgId: user.orgId } });
  const decision = String(formData.get("decision")) as "APPROVED" | "REJECTED";
  const comment = String(formData.get("comment") ?? "") || null;
  await db.approval.update({ where: { id }, data: { decision, comment, approverId: user.id, decidedAt: new Date() } });
  // If all deployment stages approved → system APPROVED; if any rejected → stays
  if (a.subjectType === "SYSTEM_DEPLOYMENT") {
    const all = await db.approval.findMany({ where: { orgId: user.orgId, subjectType: "SYSTEM_DEPLOYMENT", subjectId: a.subjectId } });
    if (all.every((x) => x.decision === "APPROVED")) await db.aiSystem.update({ where: { id: a.subjectId }, data: { lifecycleStage: "APPROVED" } }).catch(() => {});
    await db.evidence.create({ data: { orgId: user.orgId, systemId: a.subjectId, type: "APPROVAL_RECORD", source: "ATTESTATION", title: `${a.stage}: ${decision}`, description: `${a.subjectLabel ?? a.subjectId} — decided by ${user.name}${comment ? `: ${comment}` : ""}`, createdById: user.id } }).catch(() => {});
  }
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: `approval.${decision.toLowerCase()}`, entityType: "Approval", entityId: id, summary: `${a.subjectLabel ?? a.subjectId} · ${a.stage}` } });
  revalidatePath("/approvals");
}

export async function createTaskAction(formData: FormData) {
  const user = await requireRole("TESTER");
  await db.task.create({ data: { orgId: user.orgId, title: String(formData.get("title")), description: String(formData.get("description") ?? "") || null, assigneeId: String(formData.get("assigneeId") || "") || null, dueDate: formData.get("dueDate") ? new Date(String(formData.get("dueDate"))) : null, status: "OPEN" } });
  revalidatePath("/approvals");
}

export async function setTaskStatusAction(id: string, formData: FormData) {
  const user = await requireRole("TESTER");
  await db.task.findFirstOrThrow({ where: { id, orgId: user.orgId } });
  await db.task.update({ where: { id }, data: { status: String(formData.get("status")) as "OPEN" | "IN_PROGRESS" | "DONE" | "CANCELLED" } });
  revalidatePath("/approvals");
}
