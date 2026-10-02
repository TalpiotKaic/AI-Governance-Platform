import { CheckCircle2, AlertTriangle, XCircle, MinusCircle } from "lucide-react";
import { Badge, toneForVerdict, toneForSeverity } from "@/components/ui/badge";
import { getI18n } from "@/lib/i18n/server";


export async function VerdictBadge({ verdict }: { verdict: string | null | undefined }) {
  const { L } = await getI18n();
  const v = verdict ?? "NOT_EVALUATED";
  const Icon = v === "PASS" ? CheckCircle2 : v === "WARN" ? AlertTriangle : v === "FAIL" ? XCircle : MinusCircle;
  return <Badge tone={toneForVerdict(v)}><Icon className="h-3 w-3" />{L(v)}</Badge>;
}

export async function SeverityBadge({ severity }: { severity: string | null | undefined }) {
  const { L } = await getI18n();
  if (!severity) return <Badge>—</Badge>;
  return <Badge tone={toneForSeverity(severity)}>{L(severity)}</Badge>;
}
