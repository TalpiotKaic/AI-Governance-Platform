/**
 * Vendor due-diligence scoring (0–100, higher = riskier) and the structured data-sensitivity profile.
 * Six items scored 0 (good) … 3 (poor), weighted, normalised to 100. Aligned with ISO/IEC 42001 A.10.3,
 * NIST AI RMF GOVERN 6, EU AI Act supply-chain duties and GDPR/PIPA transfer rules.
 */
export type AssessmentKey = "dataAccess" | "security" | "dataGovernance" | "transparency" | "jurisdiction" | "continuity";
export type AssessmentScores = Partial<Record<AssessmentKey, 0 | 1 | 2 | 3>>;
export interface VendorAssessment { scores: AssessmentScores; note?: string | null; assessedAt: string; assessedBy?: string | null }
export interface VendorDataProfile { dataTypes: string[]; personalData: boolean; sensitiveData: boolean; conditions: string[]; note?: string | null }

export const ASSESSMENT_ITEMS: { key: AssessmentKey; label: string; weight: number; refs: string; levels: [string, string, string, string] }[] = [
  { key: "dataAccess", label: "Data access scope", weight: 25, refs: "ISO/IEC 42001 A.10.3 · GDPR Art. 28", levels: ["No data or anonymised data only", "Internal / business data, no personal data", "Personal data (pseudonymised or limited fields)", "Raw personal or sensitive data transmitted"] },
  { key: "security", label: "Security & certification maturity", weight: 20, refs: "ISO/IEC 27036 · A.10.3", levels: ["Valid ISO 27001 / SOC 2 Type II or equivalent, questionnaire answered", "Certification in progress or partial questionnaire", "Self-attestation only", "No certification, questionnaire unanswered"] },
  { key: "dataGovernance", label: "Data governance & training use", weight: 15, refs: "EU AI Act Art. 10 · A.7", levels: ["Contractual no-training clause, retention period and deletion defined", "No-training clause but retention unclear", "Training use opt-out only", "Customer data may be used for training; retention policy unknown"] },
  { key: "transparency", label: "Transparency & documentation", weight: 15, refs: "EU AI Act Art. 25 · Art. 53 · A.10.2", levels: ["Model/system cards, change notices and version pinning available", "Documentation available, changes announced late", "Sparse documentation", "No documentation, unannounced model replacement"] },
  { key: "jurisdiction", label: "Legal jurisdiction & data transfer", weight: 10, refs: "PIPA Art. 28-8 · GDPR Ch. V", levels: ["Domestic or adequacy-decision country, DPA signed", "Transfer with standard clauses", "Transfer basis under review", "Cross-border transfer without legal basis"] },
  { key: "continuity", label: "Substitutability & continuity", weight: 15, refs: "NIST AI RMF GOVERN 6.2", levels: ["Alternative vendor ready, SLA and incident response defined", "SLA defined, alternative not tested", "Single dependency, informal fallback", "Single dependency, no fallback or exit plan"] },
];

/** Weighted 0–100 score; null when no item has been scored. */
export function computeVendorRisk(scores: AssessmentScores): number | null {
  const scored = ASSESSMENT_ITEMS.filter((i) => scores[i.key] !== undefined);
  if (!scored.length) return null;
  const sum = scored.reduce((n, i) => n + (scores[i.key] as number) * i.weight, 0);
  const weight = scored.reduce((n, i) => n + i.weight, 0);
  return Math.round((sum / (3 * weight)) * 100);
}
export const VENDOR_HIGH_RISK = 60;
export function vendorRiskBand(score: number | null): "LOW" | "MEDIUM" | "HIGH" | null {
  if (score === null) return null;
  return score >= VENDOR_HIGH_RISK ? "HIGH" : score >= 35 ? "MEDIUM" : "LOW";
}

export const DATA_TYPES = ["No data access (infrastructure only)", "Anonymised statistics", "Internal documents", "Customer conversation transcripts", "Customer identifiers & contact data", "Transaction & financial records", "Employee / HR data", "Health or patient records", "Biometric data", "Source code & prompts"] as const;
export const DATA_CONDITIONS = ["Pseudonymised before transfer", "Contractual no-training clause", "Zero data retention", "Retention ≤ 30 days", "Encrypted in transit and at rest", "Domestic region only", "Access logged & auditable", "DPA / processing agreement signed"] as const;

/** One-line summary for reports and the legacy dataSensitivity field (English canonical). */
export function dataProfileSummary(p: VendorDataProfile, t: (k: string) => string = (k) => k): string {
  const parts: string[] = [];
  if (p.dataTypes.length) parts.push(p.dataTypes.map((d) => t(d)).join(", "));
  const flags = [p.personalData ? t("personal data") : null, p.sensitiveData ? t("sensitive data") : null].filter(Boolean);
  if (flags.length) parts.push(flags.join(" · "));
  if (p.conditions.length) parts.push(p.conditions.map((c) => t(c)).join(" · "));
  if (p.note) parts.push(p.note);
  return parts.join(" · ");
}
export function parseAssessment(v: unknown): VendorAssessment | null {
  if (!v || typeof v !== "object" || !("scores" in v)) return null;
  return v as VendorAssessment;
}
export function parseDataProfile(v: unknown): VendorDataProfile | null {
  if (!v || typeof v !== "object" || !("dataTypes" in v)) return null;
  return v as VendorDataProfile;
}
