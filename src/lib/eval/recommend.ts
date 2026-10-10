// Recommended evaluation: picks the library scenarios that matter for a system from its intake answers and risks,
// so most users never need to design a plan by hand. Imported (organisation) scenarios and user testing stay opt-in.
import { db } from "@/lib/db";
import type { TestCategory } from "@/generated/prisma/client";

type Sys = { id: string; orgId: string; type: string; customerFacing: boolean; automatedDecision: boolean; usesPersonalData: boolean; usesSensitiveData: boolean; euAiActCategory: string; risks: { dimension: string }[] };
export type Recommendation = { id: string; code: string; name: string; category: TestCategory; testingType: string; prompts: number; reason: string };


/** Why a category is recommended for this system (translation key), or null when it is not needed. */
export function categoryReason(c: TestCategory, s: Sys): string | null {
  const dims = new Set(s.risks.map((r) => r.dimension));
  const high = s.euAiActCategory === "HIGH_RISK" || s.euAiActCategory === "GPAI_SYSTEMIC";
  switch (c) {
    case "QUALITY": return "Baseline: accuracy and hallucination";
    case "SAFETY": return "Baseline: harmful or unsafe output";
    case "SECURITY": return "Baseline: prompt injection and jailbreaks";
    case "ROBUSTNESS": return "Baseline: robustness to noisy or rephrased input";
    case "AGENT": return "Agent system: tool use and unsafe actions";
    case "FAIRNESS": return s.automatedDecision ? "Automated decisions about people" : dims.has("BIAS_FAIRNESS") ? "Fairness risk in the register" : high ? "High-risk classification" : s.customerFacing ? "Customer-facing output" : null;
    case "PRIVACY": return s.usesSensitiveData ? "Processes sensitive data" : s.usesPersonalData ? "Processes personal data" : dims.has("PRIVACY") ? "Privacy risk in the register" : null;
    case "TRANSPARENCY": return s.customerFacing ? "Customer-facing: AI disclosure" : s.euAiActCategory === "LIMITED_TRANSPARENCY" ? "EU AI Act transparency obligations" : null;
    default: return null; // PERFORMANCE and others: opt-in
  }
}

export async function recommendScenarios(s: Sys): Promise<Recommendation[]> {
  const scenarios = await db.testScenario.findMany({ where: { orgId: null, applicableTo: { has: s.type as never } }, orderBy: { code: "asc" }, include: { method: true } });
  return scenarios.flatMap((sc) => {
    if (sc.method.testingType === "USER_TESTING") return [];
    const reason = categoryReason(sc.method.category, s);
    if (!reason) return [];
    return [{ id: sc.id, code: sc.code, name: sc.name, category: sc.method.category, testingType: sc.method.testingType, prompts: (sc.prompts as unknown[]).length, reason }];
  });
}
