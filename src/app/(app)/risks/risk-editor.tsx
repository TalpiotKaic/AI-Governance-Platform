"use client";
import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { Badge, toneForTier } from "@/components/ui/badge";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { riskScore, riskTierFromScore } from "@/lib/utils";
import { updateRiskAction } from "./actions";

type Props = {
  id: string; status: string; likelihood: number; severity: number;
  residualLikelihood: number | null; residualSeverity: number | null; residualScore: number | null;
  dueDate: string; mitigation: string; suggestion?: string; ret: string; cancelHref: string;
};
const LEVELS = [1, 2, 3, 4, 5];
const STATUSES = ["IDENTIFIED", "ASSESSED", "MITIGATING", "ACCEPTED", "CLOSED"];

function ScorePill({ l, s }: { l: number | null; s: number | null }) {
  const { L } = useI18n();
  if (!l || !s) return <span className="text-xs text-muted">—</span>;
  const score = riskScore(l, s), tier = riskTierFromScore(score);
  return <span className="inline-flex items-center gap-1"><Badge tone={toneForTier(tier)}>{score}</Badge><span className="text-xs text-muted">{L(tier)}</span></span>;
}

/** Expanded editor for one risk in the register (status, inherent and residual L·S, due date, mitigation). */
export function RiskEditor(p: Props) {
  const { t, L } = useI18n();
  const [l, setL] = useState(p.likelihood), [s, setS] = useState(p.severity);
  const [rl, setRl] = useState<number | null>(p.residualLikelihood), [rs, setRs] = useState<number | null>(p.residualSeverity);
  const partial = (rl === null) !== (rs === null);
  const legacy = p.residualScore !== null && p.residualLikelihood === null;
  const num = (v: string) => (v ? Number(v) : null);
  return (
    <form action={updateRiskAction.bind(null, p.id)} className="grid grid-cols-1 gap-4 rounded-md border border-primary/40 bg-surface-2/40 p-4 lg:grid-cols-4">
      <input type="hidden" name="ret" value={p.ret} />
      <Field label={t("Status")}><Select name="status" defaultValue={p.status}>{STATUSES.map((x) => <option key={x} value={x}>{L(x)}</option>)}</Select></Field>
      <div className="lg:col-span-1">
        <p className="mb-1 text-xs font-medium text-muted">{t("Inherent risk (before mitigation)")}</p>
        <div className="flex items-end gap-2">
          <Field label={t("Likelihood")}><Select name="likelihood" value={l} onChange={(e) => setL(Number(e.target.value))} className="w-20">{LEVELS.map((n) => <option key={n} value={n}>L{n}</option>)}</Select></Field>
          <Field label={t("Severity")}><Select name="severity" value={s} onChange={(e) => setS(Number(e.target.value))} className="w-20">{LEVELS.map((n) => <option key={n} value={n}>S{n}</option>)}</Select></Field>
          <div className="pb-2"><ScorePill l={l} s={s} /></div>
        </div>
      </div>
      <div className="lg:col-span-1">
        <p className="mb-1 text-xs font-medium text-muted">{t("Residual risk (after mitigation)")}</p>
        <div className="flex items-end gap-2">
          <Field label={t("Likelihood")}><Select name="residualLikelihood" value={rl ?? ""} onChange={(e) => setRl(num(e.target.value))} required={rs !== null} className="w-20"><option value="">—</option>{LEVELS.map((n) => <option key={n} value={n}>L{n}</option>)}</Select></Field>
          <Field label={t("Severity")}><Select name="residualSeverity" value={rs ?? ""} onChange={(e) => setRs(num(e.target.value))} required={rl !== null} className="w-20"><option value="">—</option>{LEVELS.map((n) => <option key={n} value={n}>S{n}</option>)}</Select></Field>
          <div className="pb-2"><ScorePill l={rl} s={rs} /></div>
        </div>
        {partial && <p className="mt-1 text-[11px] text-warning">{t("Select both residual likelihood and severity, or neither.")}</p>}
        {legacy && <p className="mt-1 text-[11px] text-muted">{t("Earlier residual score {n} was entered as a single number. Set residual L and S to replace it.").replace("{n}", String(Math.round(p.residualScore!)))}</p>}
      </div>
      <Field label={t("Due date")}><Input name="dueDate" type="date" defaultValue={p.dueDate} /></Field>
      <Field label={t("Mitigation")} className="lg:col-span-3"><Textarea name="mitigation" rows={2} defaultValue={p.mitigation} placeholder={p.suggestion || t("Controls, tests or decisions that reduce this risk")} /></Field>
      <div className="flex items-end justify-end gap-2">
        <Link href={p.cancelHref}><Button type="button" variant="ghost">{t("Cancel")}</Button></Link>
        <Button type="submit" disabled={partial}>{t("Save")}</Button>
      </div>
    </form>
  );
}
