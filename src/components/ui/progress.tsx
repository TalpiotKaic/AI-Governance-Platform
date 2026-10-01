import { cn } from "@/lib/utils";

export function Progress({ value, className, tone = "primary" }: { value: number; className?: string; tone?: "primary" | "success" | "warning" | "danger" }) {
  const colors = { primary: "bg-primary", success: "bg-success", warning: "bg-warning", danger: "bg-danger" };
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-2", className)}>
      <div className={cn("h-full rounded-full transition-all", colors[tone])} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function ScoreRing({ value, size = 72, label }: { value: number | null | undefined; size?: number; label?: string }) {
  const v = value ?? 0;
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const color = v >= 80 ? "var(--success)" : v >= 60 ? "var(--warning)" : "var(--danger)";
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label ?? "Score"} ${Math.round(v)}`}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--border)" strokeWidth={6} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={value === null || value === undefined ? "var(--border)" : color}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="fill-foreground" style={{ fontSize: size / 4, fontWeight: 600 }}>
          {value === null || value === undefined ? "—" : Math.round(v)}
        </text>
      </svg>
      {label && <span className="text-[11px] text-muted">{label}</span>}
    </div>
  );
}
