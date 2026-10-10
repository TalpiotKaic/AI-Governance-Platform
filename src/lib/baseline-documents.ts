// Baseline governance document set: six starter drafts that cover the organisation-level
// requirements of every framework (policy, roles, objectives, risk procedure, records, AI literacy).
import type { DocumentType } from "@/generated/prisma/client";
import type { Locale } from "@/lib/i18n/dict";
import { ko } from "@/lib/baseline-templates/ko";
import { en } from "@/lib/baseline-templates/en";
import { de } from "@/lib/baseline-templates/de";
import { fr } from "@/lib/baseline-templates/fr";
import { it } from "@/lib/baseline-templates/it";
import { es } from "@/lib/baseline-templates/es";

export const BASELINE_KEYS = ["ai_policy", "roles", "objectives", "risk_procedure", "records", "literacy"] as const;
export type BaselineKey = (typeof BASELINE_KEYS)[number];
export type BaselineTemplate = { title: string; body: (org: string, systems: string) => string };
export type BaselineSet = Record<BaselineKey, BaselineTemplate>;

export const BASELINE: Record<BaselineKey, { docType: DocumentType; controlCodes: string[]; reviewCycleMonths: number }> = {
  ai_policy:      { docType: "POLICY",     controlCodes: ["HC-01"],          reviewCycleMonths: 12 },
  roles:          { docType: "ROLES",      controlCodes: ["HC-02"],          reviewCycleMonths: 12 },
  objectives:     { docType: "OBJECTIVES", controlCodes: ["HC-01", "HC-19"], reviewCycleMonths: 12 },
  risk_procedure: { docType: "PROCEDURE",  controlCodes: ["HC-04"],          reviewCycleMonths: 12 },
  records:        { docType: "RECORDS",    controlCodes: ["HC-12"],          reviewCycleMonths: 24 },
  literacy:       { docType: "PLAN",       controlCodes: ["HC-17"],          reviewCycleMonths: 12 },
};

const SETS: Record<Locale, BaselineSet> = { ko, en, de, fr, it, es };

export function baselineTemplate(locale: Locale, key: BaselineKey): BaselineTemplate {
  return (SETS[locale] ?? en)[key];
}
