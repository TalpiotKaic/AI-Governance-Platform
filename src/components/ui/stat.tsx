import { cn } from "@/lib/utils";
import { Card } from "./card";

export function Stat({ label, value, hint, tone, className }: { label: string; value: React.ReactNode; hint?: string; tone?: "success" | "warning" | "danger" | "info"; className?: string }) {
  const toneCls = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "danger" ? "text-danger" : tone === "info" ? "text-info" : "";
  return (
    <Card className={cn("px-4 py-3", className)}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold tabular-nums", toneCls)}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted">{hint}</p>}
    </Card>
  );
}
