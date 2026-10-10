import { Badge, toneForStatus, toneForTier } from "@/components/ui/badge";
import { getI18n } from "@/lib/i18n/server";
import { riskTierFromScore } from "@/lib/utils";
import { OPEN_RISK_STATUSES, isDueWithin, isOverdue } from "@/lib/risks/due";

type R = { status: string; score: number; residualScore: number | null; dueDate: Date | null };
const STATUSES = ["IDENTIFIED", "ASSESSED", "MITIGATING", "ACCEPTED", "CLOSED"];
const TIERS = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

const H = ({ children }: { children: React.ReactNode }) => <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{children}</p>;
const Bar = ({ value, max, tone }: { value: number; max: number; tone: string }) => (
  <div className="h-1.5 flex-1 overflow-hidden rounded bg-surface-2"><div className={`h-full rounded ${tone}`} style={{ width: `${max ? Math.round((value / max) * 100) : 0}%` }} /></div>
);
const TIER_BAR: Record<string, string> = { CRITICAL: "bg-danger", HIGH: "bg-warning", MEDIUM: "bg-info", LOW: "bg-success" };

/** Register overview below the dimension filter: status, tiers before/after mitigation, actions due, average score change. */
export async function RiskSummary({ risks }: { risks: R[] }) {
  const { t, L } = await getI18n();
  const isOpen = (r: R) => (OPEN_RISK_STATUSES as readonly string[]).includes(r.status);
  // "Carried" risks = still held by the organisation: open + accepted.
  const carried = risks.filter((r) => isOpen(r) || r.status === "ACCEPTED");
  const residualOf = (r: R) => r.residualScore ?? r.score;
  const byStatus = STATUSES.map((s) => [s, risks.filter((r) => r.status === s).length] as const);
  const maxStatus = Math.max(1, ...byStatus.map(([, n]) => n));
  const tiers = TIERS.map((tier) => [tier, carried.filter((r) => riskTierFromScore(r.score) === tier).length, carried.filter((r) => riskTierFromScore(residualOf(r)) === tier).length] as const);
  const maxTier = Math.max(1, ...tiers.flatMap(([, a, b]) => [a, b]));
  const overdue = risks.filter((r) => isOverdue(r)).length;
  const dueSoon = risks.filter((r) => isDueWithin(r, 30)).length;
  const notAssessed = carried.filter((r) => r.residualScore === null).length;
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const avgInherent = avg(carried.map((r) => r.score)), avgResidual = avg(carried.map(residualOf));
  const reduction = avgInherent ? Math.round(((avgInherent - avgResidual) / avgInherent) * 100) : 0;

  if (!risks.length) return <p className="text-xs text-muted">{t("No risks in this view.")}</p>;
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <div>
        <H>{t("By status")}</H>
        <ul className="space-y-1.5 text-xs">{byStatus.map(([s, n]) => <li key={s} className="flex items-center gap-2"><Badge tone={toneForStatus(s)} className="w-20 justify-center">{L(s)}</Badge><Bar value={n} max={maxStatus} tone="bg-primary/70" /><span className="w-6 text-right tabular-nums">{n}</span></li>)}</ul>
      </div>
      <div>
        <H>{t("By tier: inherent → residual")}</H>
        <ul className="space-y-1.5 text-xs">{tiers.map(([tier, a, b]) => <li key={tier} className="flex items-center gap-2"><Badge tone={toneForTier(tier)} className="w-14 justify-center">{L(tier)}</Badge><span className="w-5 text-right tabular-nums text-muted">{a}</span><span className="text-muted">→</span><span className="w-5 tabular-nums font-semibold">{b}</span><Bar value={b} max={maxTier} tone={TIER_BAR[tier]} /></li>)}</ul>
        <p className="mt-2 text-[11px] text-muted">{t("Open and accepted risks ({n}).").replace("{n}", String(carried.length))}</p>
      </div>
      <div>
        <H>{t("Action status")}</H>
        <dl className="space-y-2 text-xs">
          <div className="flex items-center justify-between"><dt>{t("Overdue")}</dt><dd><Badge tone={overdue ? "danger" : "success"}>{overdue}</Badge></dd></div>
          <div className="flex items-center justify-between"><dt>{t("Due within 30 days")}</dt><dd><Badge tone={dueSoon ? "warning" : "neutral"}>{dueSoon}</Badge></dd></div>
          <div className="flex items-center justify-between"><dt>{t("Residual not yet assessed")}</dt><dd><Badge tone={notAssessed ? "info" : "success"}>{notAssessed}</Badge></dd></div>
        </dl>
      </div>
      <div>
        <H>{t("Average score")}</H>
        <div className="flex items-end gap-3">
          <div><p className="text-[11px] text-muted">{t("Inherent")}</p><p className="text-2xl font-semibold tabular-nums">{carried.length ? Math.round(avgInherent) : "—"}</p></div>
          <span className="pb-1.5 text-muted">→</span>
          <div><p className="text-[11px] text-muted">{t("Residual")}</p><p className="text-2xl font-semibold tabular-nums">{carried.length ? Math.round(avgResidual) : "—"}</p></div>
        </div>
        <p className={`mt-1 text-xs ${reduction > 0 ? "text-success" : "text-muted"}`}>{carried.length ? t("{n}% lower after mitigation").replace("{n}", String(reduction)) : ""}</p>
        <p className="mt-1 text-[11px] text-muted">{t("Risks without a residual assessment count at their inherent score.")}</p>
      </div>
    </div>
  );
}
