import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { enumLabel } from "@/lib/utils";
import { SeverityBadge } from "@/components/domain/verdict";

export const metadata = { title: "Test Library" };

export default async function LibraryPage() {
  await requireUser();
  const methods = await db.testMethod.findMany({ orderBy: { sortOrder: "asc" }, include: { controls: { include: { control: true } }, scenarios: true } });
  const scenarios = await db.testScenario.findMany({ orderBy: { code: "asc" }, include: { method: true } });
  return (
    <>
      <PageHeader title="Test Library" description="Standardised test methods (metrics, thresholds, reference standards) and reusable scenarios (prompt sets, red-team scripts, annotation schemas, questionnaires) — aligned with NIST AI 200-3 Materials and mapped to harmonized controls. The library is the asset that makes Control → Test Requirement → Test Method → Result traceable and repeatable." />
      <Card className="mb-4"><CardHeader><CardTitle>Test methods ({methods.length})</CardTitle><CardDescription>Each method defines metrics with acceptance thresholds and maps to harmonized controls.</CardDescription></CardHeader><CardContent className="px-0 pb-0">
        <Table><THead><TR><TH>Code</TH><TH>Method</TH><TH>Category</TH><TH>Testing type</TH><TH>Reference</TH><TH>Metrics (threshold)</TH><TH>Controls</TH><TH>Scenarios</TH></TR></THead><TBody>
          {methods.map((m) => <TR key={m.id}><TD className="font-mono text-xs">{m.code}</TD><TD><Link href={`/library/${m.code}`} className="font-medium hover:underline">{m.name}</Link><div className="line-clamp-2 text-xs text-muted">{m.description}</div></TD><TD><Badge>{enumLabel(m.category)}</Badge></TD><TD><Badge tone={m.testingType === "RED_TEAMING" ? "danger" : m.testingType === "USER_TESTING" ? "accent" : "info"}>{enumLabel(m.testingType)}</Badge></TD><TD className="text-[11px] text-muted">{m.standardRef}</TD><TD className="text-xs">{(m.metrics as { name: string; direction: string; threshold: number; unit?: string }[]).map((x) => <div key={x.name}>{x.name} <span className="text-muted">{x.direction === "lower" ? "≤" : "≥"} {x.unit === "rate" ? `${Math.round(x.threshold * 100)}%` : x.unit === "ms" ? `${x.threshold} ms` : x.threshold}</span></div>)}</TD><TD className="text-xs">{m.controls.map((c) => c.control.code).join(", ")}</TD><TD className="tabular-nums">{m.scenarios.length}</TD></TR>)}
        </TBody></Table>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Scenario library ({scenarios.length})</CardTitle><CardDescription>Including NIST ARIA Appendix C examples (Healthcare-Privacy, Manufacturing-Safety), agentic red-teaming scripts (tool misuse, exfiltration, multi-turn manipulation) and EU AI Act Art. 50 disclosure tests.</CardDescription></CardHeader><CardContent className="px-0 pb-0">
        <Table><THead><TR><TH>Code</TH><TH>Scenario</TH><TH>Method</TH><TH>Sector</TH><TH>Target concept</TH><TH>Tactic</TH><TH>Prompts</TH><TH>Annotation items</TH><TH>Severity</TH></TR></THead><TBody>
          {scenarios.map((s) => <TR key={s.id}><TD className="font-mono text-xs">{s.code}</TD><TD><Link href={`/library/${s.method.code}?scenario=${s.code}`} className="font-medium hover:underline">{s.name}</Link><div className="line-clamp-2 text-xs text-muted">{s.description}</div></TD><TD className="text-xs">{s.method.code}</TD><TD className="text-xs">{s.sector}</TD><TD className="text-xs">{s.targetConcept}</TD><TD className="text-xs">{s.tactic ?? "—"}</TD><TD className="tabular-nums">{(s.prompts as unknown[]).length}</TD><TD className="tabular-nums">{(s.annotationSchema as unknown[]).length}</TD><TD><SeverityBadge severity={s.defaultSeverity} /></TD></TR>)}
        </TBody></Table>
      </CardContent></Card>
    </>
  );
}
