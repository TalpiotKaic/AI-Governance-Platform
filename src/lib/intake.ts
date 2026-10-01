import { riskTierFromScore } from "@/lib/utils";

/** Intake-driven risk tiering: context → tier (intake answers trigger the review workflow). */
export function intakeTier(d: { euAiActCategory: string; usesSensitiveData: boolean; usesPersonalData: boolean; customerFacing: boolean; automatedDecision: boolean; type: string }) {
  let score = 20;
  if (d.euAiActCategory === "HIGH_RISK" || d.euAiActCategory === "PROHIBITED" || d.euAiActCategory === "GPAI_SYSTEMIC") score += 45;
  if (d.euAiActCategory === "LIMITED_TRANSPARENCY") score += 10;
  if (d.usesSensitiveData) score += 15; else if (d.usesPersonalData) score += 8;
  if (d.customerFacing) score += 8;
  if (d.automatedDecision) score += 12;
  if (d.type === "AGENT" || d.type === "MULTI_AGENT") score += 12;
  score = Math.min(100, score);
  return { score, tier: riskTierFromScore(score) };
}
