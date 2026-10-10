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

const RISK_STATUSES: RiskStatus[] = ["IDENTIFIED", "ASSESSED", "MITIGATING", "ACCEPTED", "CLOSED"];
const level = (v: FormDataEntryValue | null) => { const n = Number(v); return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null; };

/** Keep only the register's own view parameters when returning to the list. */
function returnQuery(raw: FormDataEntryValue | null) {
  const src = new URLSearchParams(typeof raw === "string" ? raw : "");
  const out = new URLSearchParams();
  for (const k of ["dimension", "view", "all"]) { const v = src.get(k); if (v && /^[A-Za-z_0-9]{1,40}$/.test(v)) out.set(k, v); }
  const q = out.toString();
  return q ? `?${q}` : "";
}

/** Save a risk from the register editor: status, inherent L/S, residual L/S, due date and mitigation. Scores are recomputed. */
export async function updateRiskAction(id: string, formData: FormData) {
  const user = await requirePermission("risks.write");
  const r = await db.risk.findFirstOrThrow({ where: { id, orgId: user.orgId } });
  const statusRaw = String(formData.get("status"));
  const status = (RISK_STATUSES as string[]).includes(statusRaw) ? (statusRaw as RiskStatus) : r.status;
  const likelihood = level(formData.get("likelihood")) ?? r.likelihood;
  const severity = level(formData.get("severity")) ?? r.severity;
  const rl = level(formData.get("residualLikelihood")), rs = level(formData.get("residualSeverity"));
  const residual = rl !== null && rs !== null ? { residualLikelihood: rl, residualSeverity: rs, residualScore: riskScore(rl, rs) } : {};
  const due = String(formData.get("dueDate") ?? "");
  const mitigation = String(formData.get("mitigation") ?? "").trim();
  await db.risk.update({ where: { id }, data: {
    status, likelihood, severity, score: riskScore(likelihood, severity), ...residual,
    mitigation: mitigation || null, ...(due ? { dueDate: new Date(due) } : {}),
  } });
  if (status === "ACCEPTED" && r.status !== "ACCEPTED") await db.approval.create({ data: { orgId: user.orgId, subjectType: "RISK_ACCEPTANCE", subjectId: r.code, subjectLabel: `${r.code} ${r.title} (residual risk acceptance)`, stage: "Risk owner acceptance" } });
  if (status === "CLOSED" || status === "ACCEPTED") await db.task.updateMany({ where: { orgId: user.orgId, relatedType: "risk", relatedId: id, status: { in: ["OPEN", "IN_PROGRESS"] } }, data: { status: "DONE" } });
  const changes = [
    r.status !== status ? `status ${r.status}→${status}` : "",
    r.likelihood !== likelihood || r.severity !== severity ? `L${r.likelihood}·S${r.severity}→L${likelihood}·S${severity}` : "",
    "residualScore" in residual && (r.residualLikelihood !== rl || r.residualSeverity !== rs) ? `residual L${rl}·S${rs} (${residual.residualScore})` : "",
    mitigation !== (r.mitigation ?? "") ? "mitigation" : "",
    due && r.dueDate?.toISOString().slice(0, 10) !== due ? `due ${due}` : "",
  ].filter(Boolean).join(", ");
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "risk.updated", entityType: "Risk", entityId: id, summary: `${r.code} ${changes || "updated"}` } });
  revalidatePath("/risks"); revalidatePath("/dashboard"); revalidatePath("/approvals"); revalidatePath(`/systems/${r.systemId}`);
  redirect(`/risks${returnQuery(formData.get("ret"))}`);
}
