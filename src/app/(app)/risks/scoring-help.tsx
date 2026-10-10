"use client";
import { useState } from "react";
import { Calculator } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

const H = ({ children }: { children: React.ReactNode }) => <h3 className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-muted first:mt-0">{children}</h3>;

/** "How scores are calculated" button + reference popup for the risk register. */
export function ScoringHelp() {
  const { t, L } = useI18n();
  const [open, setOpen] = useState(false);
  const seeds: [string, string, string, string, string][] = [
    [t("Type is not predictive ML"), t("Inaccurate or hallucinated outputs in the intended context"), L("ACCURACY_EFFICACY"), "3", "3"],
    [t("Type is not predictive ML"), t("Prompt injection / jailbreak leading to policy violation"), L("SECURITY"), "3", "4"],
    [t("Automated decision or EU AI Act high-risk"), t("Disparate treatment of protected groups"), L("BIAS_FAIRNESS"), "3", t("5 if high-risk, otherwise 3")],
    [t("Processes personal data"), t("Unauthorised disclosure of personal / sensitive data"), L("PRIVACY"), "3", t("5 if sensitive data, otherwise 4")],
    [t("Agent or multi-agent"), t("Agent executes unsafe or unauthorised actions via tools"), L("AGENT_BEHAVIOR"), "3", "5"],
    [t("Customer-facing"), t("Users not informed they are interacting with AI (Art. 50 / 제31조)"), L("TRANSPARENCY_EXPLAINABILITY"), "2", "3"],
  ];
  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}><Calculator className="h-3.5 w-3.5" /> {t("How scores are calculated")}</Button>
      <Modal open={open} onClose={() => setOpen(false)} title={t("Risk scoring method")}>
        <H>{t("Inputs")}</H>
        <p>{t("Initial risks are generated automatically when an AI system is registered, from these intake answers only: system type, EU AI Act category, and the four data flags (personal data, sensitive data, customer-facing, automated decision). They are rule-based starting values, not an assessment — the risk owner refines L, S, mitigation and due date afterwards.")}</p>
        <H>{t("Which risks are created")}</H>
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-xs"><thead className="bg-surface-2 text-left text-muted"><tr><th className="px-2 py-1.5">{t("Condition")}</th><th className="px-2 py-1.5">{t("Risk")}</th><th className="px-2 py-1.5">{t("Dimension")}</th><th className="px-2 py-1.5">L</th><th className="px-2 py-1.5">S</th></tr></thead>
            <tbody>{seeds.map((r, i) => <tr key={i} className="border-t border-border"><td className="px-2 py-1.5 text-muted">{r[0]}</td><td className="px-2 py-1.5">{r[1]}</td><td className="px-2 py-1.5">{r[2]}</td><td className="px-2 py-1.5 tabular-nums">{r[3]}</td><td className="px-2 py-1.5 tabular-nums">{r[4]}</td></tr>)}</tbody></table>
        </div>
        <H>{t("Score formula")}</H>
        <p><span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs">score = (L × 1 + S × 3) ÷ 20 × 100</span> — {t("severity is weighted three times likelihood (L and S each 1–5).")}</p>
        <p className="mt-1 text-muted">{t("Examples: L3·S5 = 90, L3·S4 = 75, L3·S3 = 60, L2·S3 = 55.")}</p>
        <p className="mt-1">{t("Bands: ≥ 80 CRITICAL · 60–79 HIGH · 35–59 MEDIUM · < 35 LOW. The heat-map cells use the same bands.")}</p>
        <H>{t("Inherent and residual risk")}</H>
        <p>{t("Inherent L and S describe the risk before mitigation. After mitigation the owner opens Edit and records residual L and S; the residual score uses the same formula. The heat map shows either position — open risks only by default, closed and accepted risks on request. Risks without a residual assessment stay at their inherent position in the residual view.")}</p>
        <H>{t("Code, status and owner")}</H>
        <p>{t("Codes run sequentially per organisation (R-0001, R-0002…). New risks start as Identified with source Intake; the owner is the user who registered the system.")}</p>
        <H>{t("Risks added later")}</H>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t("HIGH / CRITICAL findings from an evaluation run add a risk with L3·S4 (75) or L3·S5 (90), source Test finding, linked to the finding.")}</li>
          <li>{t("A vendor scoring ≥ 60 in due diligence that is linked to a high-risk system adds an Exposure risk with L3 and S4 (S5 when the vendor scores ≥ 80), source Vendor.")}</li>
          <li>{t("A reported incident adds an Exposure risk with L4 and S by incident severity, source Incident.")}</li>
        </ul>
        <H>{t("Default due dates")}</H>
        <p>{t("Automatically created risks receive a remediation due date from their score: CRITICAL (≥ 80) 30 days, HIGH (60–79) 45 days, others 90 days. Overdue open risks are highlighted here, listed on the dashboard and create a follow-up task in Approvals & Tasks. Change the date with Edit in the Update column.")}</p>
        <H>{t("System risk tier (separate formula)")}</H>
        <p>{t("The system's own tier, which sets the number of approval stages, starts at 20 and adds: EU high-risk / prohibited / GPAI with systemic risk +45, limited risk +10, sensitive data +15 (otherwise personal data +8), customer-facing +8, automated decision +12, agent or multi-agent +12; capped at 100 and mapped to the same bands.")}</p>
      </Modal>
    </>
  );
}
