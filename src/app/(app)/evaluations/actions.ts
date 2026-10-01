"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { nextCode } from "@/lib/utils";
import { startRunInBackground } from "@/lib/eval/runner";
import type { Prisma } from "@/generated/prisma/client";

function s(fd: FormData, k: string) { const v = fd.get(k); return typeof v === "string" ? v.trim() : ""; }

export async function createRunAction(formData: FormData) {
  const user = await requireRole("TESTER");
  const systemId = s(formData, "systemId");
  const system = await db.aiSystem.findFirstOrThrow({ where: { id: systemId, orgId: user.orgId } });
  const planId = s(formData, "planId") || undefined;
  const mode = s(formData, "mode") === "LIVE" ? "LIVE" : "DEMO";
  const adapter = s(formData, "adapter") || "demo";
  const scenarioIds = formData.getAll("scenarioIds").map(String).filter(Boolean);
  const count = await db.evaluationRun.count({ where: { orgId: user.orgId } });
  const targetConfig: Record<string, unknown> = {
    adapter: mode === "DEMO" ? "demo" : adapter,
    model: s(formData, "model") || undefined,
    baseUrl: s(formData, "baseUrl") || undefined,
    apiKey: s(formData, "apiKey") || undefined,
    systemPrompt: s(formData, "systemPrompt") || undefined,
    weakness: mode === "DEMO" ? Number(s(formData, "weakness") || 0.25) : undefined,
    seed: s(formData, "seed") || undefined,
    scenarioIds: scenarioIds.length ? scenarioIds : undefined,
  };
  const judgeConfig: Record<string, unknown> = mode === "DEMO" ? { adapter: "demo" } : { adapter: s(formData, "judgeAdapter") || "anthropic", model: s(formData, "judgeModel") || undefined };
  const run = await db.evaluationRun.create({ data: {
    orgId: user.orgId, systemId, planId, code: nextCode("RUN", count), name: s(formData, "name") || `${system.code} evaluation`, mode, status: "QUEUED",
    targetConfig: targetConfig as Prisma.InputJsonValue, judgeConfig: judgeConfig as Prisma.InputJsonValue,
    environment: { modelVersion: s(formData, "envModelVersion") || null, systemPromptVersion: s(formData, "envPromptVersion") || null, notes: s(formData, "envNotes") || null } as Prisma.InputJsonValue,
    createdById: user.id,
  } });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "run.created", entityType: "EvaluationRun", entityId: run.id, summary: `${run.code} ${run.name} (${mode})` } });
  startRunInBackground(run.id);
  revalidatePath("/evaluations");
  redirect(`/evaluations/${run.id}`);
}

export async function rerunAction(runId: string) {
  const user = await requireRole("TESTER");
  const run = await db.evaluationRun.findFirstOrThrow({ where: { id: runId, orgId: user.orgId } });
  if (run.status === "RUNNING") return;
  await db.evaluationRun.update({ where: { id: runId }, data: { status: "QUEUED", progress: 0, error: null } });
  startRunInBackground(runId);
  revalidatePath(`/evaluations/${runId}`);
}

export async function updateFindingStatusAction(findingId: string, formData: FormData) {
  const user = await requireRole("TESTER");
  const f = await db.finding.findFirstOrThrow({ where: { id: findingId, system: { orgId: user.orgId } } });
  const status = String(formData.get("status")) as "OPEN" | "MITIGATING" | "MITIGATED" | "ACCEPTED" | "FALSE_POSITIVE";
  await db.finding.update({ where: { id: findingId }, data: { status } });
  if (status === "MITIGATED" || status === "FALSE_POSITIVE") await db.risk.updateMany({ where: { findingId }, data: { status: status === "MITIGATED" ? "CLOSED" : "CLOSED" } });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "finding.status", entityType: "Finding", entityId: findingId, summary: `${f.code} → ${status}` } });
  revalidatePath(`/evaluations/${f.runId}`);
}

export async function addHumanAnnotationAction(sessionId: string, formData: FormData) {
  const user = await requireRole("TESTER");
  const session = await db.testSession.findFirstOrThrow({ where: { id: sessionId, run: { orgId: user.orgId } } });
  const itemKey = String(formData.get("itemKey")), value = String(formData.get("value")).toLowerCase(), rationale = String(formData.get("rationale") ?? "") || null;
  await db.annotation.create({ data: { sessionId, annotator: "HUMAN", annotatorId: user.id, itemKey, value, rationale, confidence: 1 } });
  revalidatePath(`/evaluations/${session.runId}`);
}
