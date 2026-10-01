import { CheckCircle2, AlertTriangle, XCircle, MinusCircle } from "lucide-react";
import { Badge, toneForVerdict, toneForSeverity } from "@/components/ui/badge";
import { enumLabel } from "@/lib/utils";

export function VerdictBadge({ verdict }: { verdict: string | null | undefined }) {
  const v = verdict ?? "NOT_EVALUATED";
  const Icon = v === "PASS" ? CheckCircle2 : v === "WARN" ? AlertTriangle : v === "FAIL" ? XCircle : MinusCircle;
  return <Badge tone={toneForVerdict(v)}><Icon className="h-3 w-3" />{enumLabel(v)}</Badge>;
}

export function SeverityBadge({ severity }: { severity: string | null | undefined }) {
  if (!severity) return <Badge>—</Badge>;
  return <Badge tone={toneForSeverity(severity)}>{enumLabel(severity)}</Badge>;
}
