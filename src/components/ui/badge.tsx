import * as React from "react";
import { cn } from "@/lib/utils";

export type Tone = "neutral" | "primary" | "accent" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-foreground border-border",
  primary: "bg-primary-soft text-primary border-transparent",
  accent: "bg-accent-soft text-accent border-transparent",
  success: "bg-success-soft text-success border-transparent",
  warning: "bg-warning-soft text-warning border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
  info: "bg-info-soft text-info border-transparent",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function toneForVerdict(v: string | null | undefined): Tone {
  switch (v) {
    case "PASS": return "success";
    case "WARN": return "warning";
    case "FAIL": return "danger";
    default: return "neutral";
  }
}

export function toneForSeverity(s: string | null | undefined): Tone {
  switch (s) {
    case "CRITICAL": return "danger";
    case "HIGH": return "danger";
    case "MEDIUM": return "warning";
    case "LOW": return "info";
    case "INFO": return "neutral";
    default: return "neutral";
  }
}

export function toneForTier(t: string | null | undefined): Tone {
  switch (t) {
    case "CRITICAL": return "danger";
    case "HIGH": return "danger";
    case "MEDIUM": return "warning";
    case "LOW": return "success";
    default: return "neutral";
  }
}

export function toneForStatus(s: string | null | undefined): Tone {
  switch (s) {
    case "COMPLETED": case "ISSUED": case "APPROVED": case "VERIFIED": case "IMPLEMENTED": case "DONE": case "CLOSED": case "VALID": case "ACTIVE": case "PRODUCTION": case "MITIGATED":
      return "success";
    case "RUNNING": case "IN_REVIEW": case "IN_PROGRESS": case "MITIGATING": case "INVESTIGATING": case "TESTING": case "QUEUED":
      return "info";
    case "FAILED": case "REJECTED": case "EXPIRED": case "OPEN": case "REPORTED": case "CRITICAL":
      return "danger";
    case "DRAFT": case "NOT_STARTED": case "PLANNED": case "IDENTIFIED": case "PENDING": case "DEVELOPMENT":
      return "neutral";
    case "ACCEPTED": case "SUPERSEDED": case "RETIRED": case "CANCELLED": case "NOT_APPLICABLE":
      return "neutral";
    default:
      return "neutral";
  }
}
