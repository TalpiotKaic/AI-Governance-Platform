"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { nextCode } from "@/lib/utils";
import type { Severity, IncidentStatus } from "@/generated/prisma/client";

export async function createIncidentAction(formData: FormData) {
  const user = await requirePermission("incidents.write");
  const systemId = String(formData.get("systemId") || "") || null;
  const count = await db.incident.count({ where: { orgId: user.orgId } });
  const inc = await db.incident.create({ data: { orgId: user.orgId, systemId, code: nextCode("INC", count), title: String(formData.get("title")), description: String(formData.get("description") ?? "") || null, severity: String(formData.get("severity")) as Severity, harmCategory: String(formData.get("harmCategory") || "") || null, seriousIncident: formData.get("seriousIncident") === "on", affectedCount: formData.get("affectedCount") ? Number(formData.get("affectedCount")) : null } });
  if (systemId) {
    const rc = await db.risk.count({ where: { orgId: user.orgId } });
    await db.risk.create({ data: { orgId: user.orgId, systemId, code: nextCode("R", rc), title: `Incident ${inc.code}: ${inc.title}`, dimension: "EXPOSURE", likelihood: 4, severity: inc.severity === "CRITICAL" ? 5 : inc.severity === "HIGH" ? 4 : 3, score: Math.round(((4 + (inc.severity === "CRITICAL" ? 5 : inc.severity === "HIGH" ? 4 : 3) * 3) / 20) * 100), status: "IDENTIFIED", source: "INCIDENT", ownerId: user.id } });
    await db.task.create({ data: { orgId: user.orgId, title: `Investigate ${inc.code} and re-evaluate affected categories`, assigneeId: user.id, status: "OPEN", relatedType: "incident", relatedId: inc.id, dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * (inc.seriousIncident ? 2 : 14)) } });
  }
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "incident.reported", entityType: "Incident", entityId: inc.id, summary: `${inc.code} ${inc.title}` } });
  revalidatePath("/incidents");
  redirect("/incidents");
}

export async function updateIncidentAction(id: string, formData: FormData) {
  const user = await requirePermission("incidents.write");
  await db.incident.findFirstOrThrow({ where: { id, orgId: user.orgId } });
  const status = String(formData.get("status")) as IncidentStatus;
  await db.incident.update({ where: { id }, data: { status, rootCause: String(formData.get("rootCause") ?? "") || undefined, actions: String(formData.get("actions") ?? "") || undefined, resolvedAt: status === "CLOSED" || status === "MITIGATED" ? new Date() : null } });
  revalidatePath("/incidents");
}
