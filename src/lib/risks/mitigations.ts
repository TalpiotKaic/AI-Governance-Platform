// Recommended mitigations per risk dimension. Stored in English (dictionary keys) and localized at render time
// via localizeRiskMitigation, like the intake risk titles.
export const RECOMMENDED_MITIGATION: Record<string, string> = {
  ACCURACY_EFFICACY: "Ground answers in approved sources, show citations, keep a human review step for consequential answers, and run the quality evaluation before each release.",
  BIAS_FAIRNESS: "Test outcomes across protected groups before deployment and periodically, remove proxy features, and keep a human review and appeal path for decisions about people.",
  ROBUSTNESS: "Test with noisy, rephrased and out-of-distribution input, monitor drift in production, and define a fallback when confidence is low.",
  SAFETY: "Filter harmful output, define refusal behaviour for unsafe requests, and run the safety evaluation before each release.",
  SECURITY: "Separate system instructions from user and retrieved content, filter inputs and outputs, restrict tool and data permissions, and re-run red-team tests after every prompt or model change.",
  PRIVACY: "Minimise and mask personal data in prompts and logs, enforce access control and retention limits, block personal data in outputs, and complete a privacy impact assessment.",
  TRANSPARENCY_EXPLAINABILITY: "Tell users they are interacting with AI at the start, label generated content, and explain how to reach a human.",
  ACCOUNTABILITY: "Name an accountable owner, document decisions and approvals, and keep audit logs.",
  AGENT_BEHAVIOR: "Apply least-privilege tool permissions, require human approval for high-impact actions, set budget and rate limits, keep a kill switch and log every tool call.",
  EXPOSURE: "Complete vendor due diligence, add AI-specific contract terms (data use, incident notice, audit rights), and review the vendor annually.",
};

export const recommendedMitigation = (dimension: string, findingRecommendation?: string | null) =>
  findingRecommendation?.trim() || RECOMMENDED_MITIGATION[dimension] || null;
