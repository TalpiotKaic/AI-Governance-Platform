"use client";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { Badge } from "@/components/ui/badge";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { HelpToggle } from "@/components/ui/help-toggle";
import { ASSESSMENT_ITEMS, DATA_CONDITIONS, DATA_TYPES, computeVendorRisk, vendorRiskBand, type AssessmentScores, type VendorAssessment, type VendorDataProfile } from "@/lib/vendors/assessment";

/** Six-item due-diligence checklist with a live score, plus the structured data-sensitivity profile. Renders inside the vendor <form>. */
export function AssessmentFields({ assessment, profile, currentScore }: { assessment: VendorAssessment | null; profile: VendorDataProfile | null; currentScore: number | null }) {
  const { t } = useI18n();
  const [scores, setScores] = useState<AssessmentScores>(assessment?.scores ?? {});
  const live = useMemo(() => computeVendorRisk(scores), [scores]);
  const band = vendorRiskBand(live);
  const tone = band === "HIGH" ? "danger" : band === "MEDIUM" ? "warning" : band === "LOW" ? "success" : "neutral";
  return (
    <div className="grid grid-cols-1 gap-4 md:col-span-6 md:grid-cols-2">
      <div className="rounded-md border border-border p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{t("Due-diligence assessment")}
            <HelpToggle><p>{t("Score each item 0 (good) to 3 (poor). The weighted result (0–100, higher = riskier) replaces the manual score. 0–34 low: annual review · 35–59 medium: contract remediation, semi-annual review · 60+ high: management approval, exit plan required, auto-registered as a risk when linked to a high-risk system. Saving a changed assessment files a vendor due-diligence evidence record (EV-SUP → HC-15).")}</p></HelpToggle>
          </div>
          <div className="flex items-center gap-2 text-xs"><span className="text-muted">{t("Computed score")}</span><Badge tone={tone}>{live ?? "—"}/100{band ? ` · ${t(band === "HIGH" ? "High" : band === "MEDIUM" ? "Medium" : "Low")}` : ""}</Badge></div>
        </div>
        <div className="space-y-2">
          {ASSESSMENT_ITEMS.map((item) => (
            <div key={item.key} className="grid grid-cols-1 gap-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:items-center">
              <div className="text-xs"><span className="font-medium">{t(item.label)}</span> <span className="text-muted">· {item.weight}% · {item.refs}</span></div>
              <Select name={`score:${item.key}`} value={scores[item.key] ?? ""} onChange={(e) => setScores((s) => ({ ...s, [item.key]: e.target.value === "" ? undefined : (Number(e.target.value) as 0 | 1 | 2 | 3) }))} className="h-8 text-xs">
                <option value="">{t("Not assessed")}</option>
                {item.levels.map((lv, i) => <option key={i} value={i}>{i} — {t(lv)}</option>)}
              </Select>
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
          <Field label={t("Assessment note")}><Input name="assessmentNote" defaultValue={assessment?.note ?? ""} placeholder={t("Evidence reviewed, questionnaire date, reviewer…")} /></Field>
          <Field label={t("Manual score (used only when no item is assessed)")}><Input name="riskScore" type="number" min={0} max={100} step={1} defaultValue={currentScore ?? ""} /></Field>
        </div>
        {assessment?.assessedAt && <p className="mt-1 text-[11px] text-muted">{t("Last assessed")} {assessment.assessedAt.slice(0, 10)}{assessment.assessedBy ? ` · ${assessment.assessedBy}` : ""}</p>}
      </div>
      <div className="rounded-md border border-border p-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{t("Data sensitivity profile")}
          <HelpToggle><p>{t("Describe what data the vendor actually receives: the data types, whether personal or sensitive (health, biometric, financial) data is included, and the processing conditions agreed in the contract. The summary line is stored for reports and feeds the data-access item of the assessment.")}</p></HelpToggle>
        </div>
        <p className="mb-1 text-[11px] text-muted">{t("Data types the vendor sees")}</p>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">{DATA_TYPES.map((d) => <label key={d} className="flex items-center gap-2 text-xs"><input type="checkbox" name="dataTypes" value={d} defaultChecked={profile?.dataTypes.includes(d)} className="accent-[var(--primary)]" />{t(d)}</label>)}</div>
        <div className="mt-2 flex flex-wrap gap-4"><Checkbox name="personalData" label={t("Includes personal data")} defaultChecked={profile?.personalData} /><Checkbox name="sensitiveData" label={t("Includes sensitive data (health, biometric, financial)")} defaultChecked={profile?.sensitiveData} /></div>
        <p className="mb-1 mt-2 text-[11px] text-muted">{t("Processing conditions")}</p>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">{DATA_CONDITIONS.map((c) => <label key={c} className="flex items-center gap-2 text-xs"><input type="checkbox" name="conditions" value={c} defaultChecked={profile?.conditions.includes(c)} className="accent-[var(--primary)]" />{t(c)}</label>)}</div>
        <Field label={t("Additional note")} className="mt-2"><Textarea name="dataNote" rows={2} defaultValue={profile?.note ?? ""} placeholder={t("e.g. only ticket text, customer names masked; EU region")} /></Field>
      </div>
    </div>
  );
}
