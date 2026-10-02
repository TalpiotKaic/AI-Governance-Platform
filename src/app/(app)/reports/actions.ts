"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { generateReport } from "@/lib/reports/service";
import type { ReportType } from "@/generated/prisma/client";
import { getLocale } from "@/lib/i18n/server";

export async function generateReportAction(formData: FormData) {
  const user = await requireRole("TESTER");
  const systemId = String(formData.get("systemId"));
  await db.aiSystem.findFirstOrThrow({ where: { id: systemId, orgId: user.orgId } });
  const type = String(formData.get("type")) as ReportType;
  const runIds = formData.getAll("runIds").map(String).filter(Boolean);
  const planId = String(formData.get("planId") || "") || undefined;
  const signers = { tester: String(formData.get("tester") || "") || undefined, reviewer: String(formData.get("reviewer") || "") || undefined, approver: String(formData.get("approver") || "") || undefined };
  const langRaw = String(formData.get("language") || "");
  const language = langRaw === "ko" || langRaw === "en" ? langRaw : await getLocale();
  const report = await generateReport({ orgId: user.orgId, systemId, type, runIds, planId, createdById: user.id, signers, language });
  revalidatePath("/reports");
  redirect(`/reports/${report.id}`);
}

/** Generate the same report in another language (same type, runs and plan). */
export async function regenerateReportInLanguageAction(id: string, language: "en" | "ko") {
  const user = await requireRole("TESTER");
  const r = await db.report.findFirstOrThrow({ where: { id, orgId: user.orgId }, include: { runs: true } });
  const meta = (r.content as { meta?: { planId?: string } }).meta;
  const report = await generateReport({ orgId: user.orgId, systemId: r.systemId, type: r.type, runIds: r.runs.map((x) => x.runId), planId: meta?.planId, createdById: user.id, language });
  revalidatePath("/reports");
  redirect(`/reports/${report.id}`);
}

export async function reportWorkflowAction(id: string, action: "submit" | "review" | "approve" | "issue" | "reject") {
  const user = await requireRole(action === "approve" || action === "issue" ? "APPROVER" : action === "review" ? "REVIEWER" : "TESTER");
  const r = await db.report.findFirstOrThrow({ where: { id, orgId: user.orgId } });
  const data: Record<string, unknown> = {};
  if (action === "submit") data.status = "IN_REVIEW";
  if (action === "review") { data.reviewerId = user.id; data.reviewedAt = new Date(); }
  if (action === "approve") { data.status = "APPROVED"; data.approverId = user.id; data.approvedAt = new Date(); }
  if (action === "issue") { data.status = "ISSUED"; data.issuedAt = new Date(); if (!r.approverId) { data.approverId = user.id; data.approvedAt = new Date(); } }
  if (action === "reject") data.status = "DRAFT";
  await db.report.update({ where: { id }, data });
  if (action === "issue") await db.approval.create({ data: { orgId: user.orgId, subjectType: "REPORT_ISSUANCE", subjectId: id, subjectLabel: `${r.code} ${r.title}`, stage: "Report issuance", approverId: user.id, decision: "APPROVED", decidedAt: new Date() } });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: `report.${action}`, entityType: "Report", entityId: id, summary: `${r.code} ${action}` } });
  revalidatePath(`/reports/${id}`);
}
