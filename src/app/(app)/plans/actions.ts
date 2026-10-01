"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import type { Prisma, TestingType } from "@/generated/prisma/client";

function s(fd: FormData, k: string) { const v = fd.get(k); return typeof v === "string" ? v.trim() : ""; }
function list(v: string) { return v.split("\n").map((x) => x.trim()).filter(Boolean); }

export async function createPlanAction(formData: FormData) {
  const user = await requireRole("TESTER");
  const systemId = s(formData, "systemId");
  await db.aiSystem.findFirstOrThrow({ where: { id: systemId, orgId: user.orgId } });
  const scenarioIds = formData.getAll("scenarioIds").map(String);
  const scenarios = await db.testScenario.findMany({ where: { id: { in: scenarioIds } }, include: { method: true } });
  const plan = await db.evaluationPlan.create({ data: {
    orgId: user.orgId, systemId, name: s(formData, "name") || "Evaluation plan", status: "ACTIVE", createdById: user.id,
    scope: { applications: list(s(formData, "applications")), sector: s(formData, "sector"), useCases: list(s(formData, "useCases")), targetConcept: s(formData, "targetConcept") },
    design: { modelTestingGoal: s(formData, "modelTestingGoal"), redTeamingGoal: s(formData, "redTeamingGoal"), userTestingGoal: s(formData, "userTestingGoal"), testerDistribution: s(formData, "testerDistribution") },
    materials: { modelTestingComponents: s(formData, "modelTestingComponents"), redTeamingInstructions: s(formData, "redTeamingInstructions"), userTestingInstructions: s(formData, "userTestingInstructions"), annotationComponents: s(formData, "annotationComponents") },
    infrastructure: { platform: "K-VeriAI engine (all components)", annotationTool: s(formData, "annotationTool") || "rule-based + LLM-as-judge with human validation sample", scoringTool: "severity-weighted rates, category scores, AI Assurance Score", evaluationApi: s(formData, "evaluationApi") || "adapter" },
    implementation: { redTeamers: s(formData, "redTeamers"), userTesters: s(formData, "userTesters"), annotators: s(formData, "annotators"), dataCollection: s(formData, "dataCollection"), dataAnalysis: s(formData, "dataAnalysis"), reportedResults: s(formData, "reportedResults") },
    scenarios: { create: scenarios.map((sc) => ({ scenarioId: sc.id, testingType: sc.method.testingType as TestingType })) },
  } as Prisma.EvaluationPlanUncheckedCreateInput });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "plan.created", entityType: "EvaluationPlan", entityId: plan.id, summary: plan.name } });
  revalidatePath("/plans");
  redirect(`/plans/${plan.id}`);
}

export async function setPlanStatusAction(id: string, status: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED") {
  const user = await requireRole("TESTER");
  await db.evaluationPlan.findFirstOrThrow({ where: { id, orgId: user.orgId } });
  await db.evaluationPlan.update({ where: { id }, data: { status } });
  revalidatePath(`/plans/${id}`);
}
