"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { nextCode, riskScore } from "@/lib/utils";
import { defaultDueDate } from "@/lib/risks/due";
import type { RiskDimension, RiskStatus } from "@/generated/prisma/client";

export async function createRiskAction(formData: FormData) {
  const user = await requirePermission("risks.write");
  const systemId = String(formData.get("systemId"));
  await db.aiSystem.findFirstOrThrow({ where: { id: systemId, orgId: user.orgId } });
  const likelihood = Number(formData.get("likelihood")), severity = Number(formData.get("severity"));
  const count = await db.risk.count({ where: { orgId: user.orgId } });
  const risk = await db.risk.create({ data: { orgId: user.orgId, systemId, code: nextCode("R", count), title: String(formData.get("title")), description: String(formData.get("description") ?? "") || null, dimension: String(formData.get("dimension")) as RiskDimension, likelihood, severity, score: riskScore(likelihood, severity), status: "IDENTIFIED", source: "MANUAL", ownerId: user.id, mitigation: String(formData.get("mitigation") ?? "") || null, dueDate: formData.get("dueDate") ? new Date(String(formData.get("dueDate"))) : defaultDueDate(riskScore(likelihood, severity)) } });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "risk.created", entityType: "Risk", entityId: risk.id, summary: `${risk.code} ${risk.title}` } });
  revalidatePath("/risks");
  redirect(`/systems/${systemId}?tab=risks`);
}

export async function updateRiskStatusAction(id: string, formData: FormData) {
  const user = await requirePermission("risks.write");
  const r = await db.risk.findFirstOrThrow({ where: { id, orgId: user.orgId } });
  const status = String(formData.get("status")) as RiskStatus;
  const residual = formData.get("residualScore") ? Number(formData.get("residualScore")) : undefined;
  const due = String(formData.get("dueDate") ?? "");
  await db.risk.update({ where: { id }, data: { status, residualScore: residual, mitigation: String(formData.get("mitigation") ?? "") || r.mitigation, ...(due ? { dueDate: new Date(due) } : {}) } });
  if (status === "CLOSED" || status === "ACCEPTED") await db.task.updateMany({ where: { orgId: user.orgId, relatedType: "risk", relatedId: id, status: { in: ["OPEN", "IN_PROGRESS"] } }, data: { status: "DONE" } });
  if (status === "ACCEPTED") await db.approval.create({ data: { orgId: user.orgId, subjectType: "RISK_ACCEPTANCE", subjectId: r.code, subjectLabel: `${r.code} ${r.title} (residual risk acceptance)`, stage: "Risk owner acceptance" } });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "risk.status", entityType: "Risk", entityId: id, summary: `${r.code} → ${status}` } });
  revalidatePath("/risks"); revalidatePath("/dashboard"); revalidatePath("/approvals");
}
