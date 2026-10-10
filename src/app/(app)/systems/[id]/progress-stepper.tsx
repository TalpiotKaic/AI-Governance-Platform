import Link from "next/link";
import { ArrowRight, Check, Circle, Minus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ProgressStep } from "@/lib/systems/progress";
import { createRecommendedPlanAction } from "../actions";

const LABEL: Record<ProgressStep["key"], string> = { register: "Registered", links: "Vendors & data", risks: "Risks assessed", evaluation: "Evaluated", controls: "Controls met", approval: "Deployment approved" };
const NEXT: Record<ProgressStep["key"], string> = { register: "Edit system", links: "Link vendors and datasets", risks: "Assess risks", evaluation: "Run recommended evaluation", controls: "Review controls", approval: "Open approvals" };

function detail(step: ProgressStep, t: (s: string) => string): string | null {
  const v = step.vars ?? {};
  const f = (k: string) => Object.entries(v).reduce((s, [a, b]) => s.replaceAll(`{${a}}`, String(b)), t(k));
  if (step.state === "skipped") return t("Optional for internal SaaS");
  if (step.detail === "retest") return t("Re-test required");
  switch (step.key) {
    case "links": return f("{v} vendor(s) · {d} dataset(s)");
    case "risks": return step.state === "done" ? null : Number(v.n) ? f("{n} to assess") : t("No risks yet");
    case "controls": return f("{p}% of applicable");
    case "approval": return Number(v.n) ? f("{n} pending") : null;
    default: return null;
  }
}

/** Where this system stands on the path to deployment, with one button for the next step. */
export function ProgressStepper({ systemId, steps, next, percent, canRun, t }: { systemId: string; steps: ProgressStep[]; next: ProgressStep | null; percent: number; canRun: boolean; t: (s: string) => string }) {
  return (
    <Card className="mb-4"><CardContent className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center">
      <ol className="flex flex-1 flex-wrap items-center gap-x-1 gap-y-2">
        {steps.map((s, i) => (
          <li key={s.key} className="flex items-center gap-1">
            <Link href={s.href} className={cn("flex items-center gap-1.5 rounded-md px-2 py-1 text-xs hover:bg-surface-2", next?.key === s.key && "bg-primary-soft text-primary")}>
              <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", s.state === "done" ? "border-success bg-success text-white" : s.state === "skipped" ? "border-border text-muted" : next?.key === s.key ? "border-primary text-primary" : "border-border text-muted")}>
                {s.state === "done" ? <Check className="h-3 w-3" /> : s.state === "skipped" ? <Minus className="h-3 w-3" /> : <Circle className="h-2 w-2 fill-current" />}
              </span>
              <span><span className="font-medium">{t(LABEL[s.key])}</span>{detail(s, t) && <span className="block text-[10px] text-muted">{detail(s, t)}</span>}</span>
            </Link>
            {i < steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted" />}
          </li>
        ))}
      </ol>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-xs text-muted"><span className="text-lg font-semibold tabular-nums text-foreground">{percent}%</span> {t("complete")}</span>
        {next && (next.key === "evaluation" && canRun
          ? <form action={createRecommendedPlanAction.bind(null, systemId)}><Button type="submit" size="sm"><Sparkles className="h-4 w-4" /> {t("Next")}: {t(NEXT[next.key])}</Button></form>
          : <Link href={next.href}><Button size="sm">{t("Next")}: {t(NEXT[next.key])} <ArrowRight className="h-4 w-4" /></Button></Link>)}
      </div>
    </CardContent></Card>
  );
}
