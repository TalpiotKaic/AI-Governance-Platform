import { cn } from "@/lib/utils";
import { getI18n } from "@/lib/i18n/server";

/** Horizontal single-hue bar list (magnitude). Bars <= 24px, 4px rounded data-end, value at the tip. */
export async function BarList({ items, max, unit = "", tone = "primary", className }: { items: { label: string; value: number; hint?: string; href?: string }[]; max?: number; unit?: string; tone?: "primary" | "accent" | "status"; className?: string }) {
  const { t } = await getI18n();
  const m = max ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <div className={cn("space-y-2", className)}>
      {items.map((it) => {
        const w = Math.max(2, Math.round((it.value / m) * 100));
        const color = tone === "status" ? (it.value >= 80 ? "bg-success" : it.value >= 60 ? "bg-warning" : "bg-danger") : tone === "accent" ? "bg-accent" : "bg-primary";
        return (
          <div key={it.label} className="group" title={`${it.label}: ${it.value}${unit}${it.hint ? ` — ${it.hint}` : ""}`}>
            <div className="mb-0.5 flex items-center justify-between text-xs">
              <span className="truncate text-foreground">{it.label}</span>
              <span className="ml-2 tabular-nums text-muted">{Math.round(it.value)}{unit}</span>
            </div>
            <div className="h-2.5 w-full rounded-r bg-surface-2">
              <div className={cn("h-2.5 rounded-r", color)} style={{ width: `${w}%` }} />
            </div>
          </div>
        );
      })}
      {items.length === 0 && <p className="text-xs text-muted">{t("No data.")}</p>}
    </div>
  );
}

/** Tiny sparkline for a stat tile. */
export function Sparkline({ values, width = 120, height = 32 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return <svg width={width} height={height} aria-hidden />;
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (width - 8) + 4, height - 4 - ((v - min) / span) * (height - 8)]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} role="img" aria-label={`Trend ${values.join(", ")}`}>
      <path d={d} fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={4} fill="var(--primary)" stroke="var(--surface)" strokeWidth={2} />
    </svg>
  );
}

/** Stacked status bar with legend (status palette: pass/warn/fail), labels never color-only. */
export function StatusStack({ pass, warn, fail, labels = ["Pass", "Warn", "Fail"] }: { pass: number; warn: number; fail: number; labels?: [string, string, string] | string[] }) {
  const total = pass + warn + fail || 1;
  const seg = (n: number) => `${(n / total) * 100}%`;
  return (
    <div>
      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded">
        {pass > 0 && <div className="bg-success" style={{ width: seg(pass) }} title={`${labels[0]}: ${pass}`} />}
        {warn > 0 && <div className="bg-warning" style={{ width: seg(warn) }} title={`${labels[1]}: ${warn}`} />}
        {fail > 0 && <div className="bg-danger" style={{ width: seg(fail) }} title={`${labels[2]}: ${fail}`} />}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] text-muted">
        <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-sm bg-success" />{labels[0]} {pass}</span>
        <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-sm bg-warning" />{labels[1]} {warn}</span>
        <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-sm bg-danger" />{labels[2]} {fail}</span>
      </div>
    </div>
  );
}
