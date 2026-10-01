import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge, toneForStatus, toneForTier } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Select, Input } from "@/components/ui/input";
import { enumLabel, fmtDate } from "@/lib/utils";
import { updateRiskStatusAction } from "./actions";

export const metadata = { title: "Risk Register" };

export default async function RisksPage(props: PageProps<"/risks">) {
  const user = await requireUser();
  const sp = await props.searchParams;
  const dim = typeof sp.dimension === "string" ? sp.dimension : undefined;
  const risks = await db.risk.findMany({ where: { orgId: user.orgId, ...(dim ? { dimension: dim as never } : {}) }, orderBy: [{ score: "desc" }, { createdAt: "desc" }], include: { system: true, owner: true, finding: true } });
  const dims = ["ACCURACY_EFFICACY", "BIAS_FAIRNESS", "ROBUSTNESS", "SAFETY", "SECURITY", "PRIVACY", "TRANSPARENCY_EXPLAINABILITY", "ACCOUNTABILITY", "AGENT_BEHAVIOR", "EXPOSURE"];
  // 5x5 heat matrix counts
  const matrix: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
  for (const r of risks) matrix[5 - r.severity][r.likelihood - 1]++;
  return (
    <>
      <PageHeader title="Risk Register" description="Portfolio view of AI risks across systems. Dimensions follow Holistic-AI-style multi-dimensional assessment plus agent behaviour; HIGH/CRITICAL test findings register risks automatically with full traceability." actions={<Link href="/risks/new"><Button><Plus className="h-4 w-4" /> Add risk</Button></Link>} />
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card><CardHeader><CardTitle>Likelihood × Severity</CardTitle><CardDescription>Count of risks per cell (severity weighted 3×)</CardDescription></CardHeader><CardContent>
          <div className="grid grid-cols-[auto_repeat(5,1fr)] gap-1 text-[11px]">
            <div />{[1, 2, 3, 4, 5].map((l) => <div key={l} className="text-center text-muted">L{l}</div>)}
            {matrix.map((row, i) => (<div key={i} className="contents"><div className="pr-1 text-right text-muted">S{5 - i}</div>{row.map((n, j) => { const score = Math.round((((j + 1) + (5 - i) * 3) / 20) * 100); const bg = score >= 80 ? "bg-danger-soft" : score >= 60 ? "bg-warning-soft" : score >= 35 ? "bg-info-soft" : "bg-success-soft"; return <div key={j} className={`flex h-8 items-center justify-center rounded ${bg} ${n ? "font-semibold" : "text-muted"}`} title={`L${j + 1} S${5 - i} → score ${score}`}>{n || ""}</div>; })}</div>))}
          </div>
        </CardContent></Card>
        <Card className="lg:col-span-2"><CardHeader><CardTitle>Filter by dimension</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">
          <Link href="/risks"><Badge tone={!dim ? "primary" : "neutral"} className="cursor-pointer">All ({risks.length})</Badge></Link>
          {dims.map((d) => <Link key={d} href={`/risks?dimension=${d}`}><Badge tone={dim === d ? "primary" : "neutral"} className="cursor-pointer">{enumLabel(d)}</Badge></Link>)}
        </CardContent></Card>
      </div>
      <div className="rounded-lg border border-border bg-surface">
        <Table><THead><TR><TH>Code</TH><TH>Risk</TH><TH>System</TH><TH>Dimension</TH><TH>L</TH><TH>S</TH><TH>Score</TH><TH>Source</TH><TH>Status</TH><TH>Due</TH><TH>Update</TH></TR></THead><TBody>
          {risks.map((r) => <TR key={r.id}><TD className="font-mono text-xs text-muted">{r.code}</TD><TD><div className="font-medium">{r.title}</div>{r.description && <div className="line-clamp-2 text-xs text-muted">{r.description}</div>}{r.finding && <Link href={`/evaluations/${r.finding.runId}?tab=findings`} className="text-xs text-primary hover:underline">← finding {r.finding.code}</Link>}</TD><TD className="text-xs"><Link href={`/systems/${r.systemId}?tab=risks`} className="hover:underline">{r.system.code}</Link></TD><TD><Badge>{enumLabel(r.dimension)}</Badge></TD><TD className="tabular-nums">{r.likelihood}</TD><TD className="tabular-nums">{r.severity}</TD><TD><Badge tone={toneForTier(r.score >= 80 ? "CRITICAL" : r.score >= 60 ? "HIGH" : r.score >= 35 ? "MEDIUM" : "LOW")}>{Math.round(r.score)}</Badge>{r.residualScore !== null && <div className="text-[10px] text-muted">residual {Math.round(r.residualScore)}</div>}</TD><TD className="text-xs">{enumLabel(r.source)}</TD><TD><Badge tone={toneForStatus(r.status)}>{enumLabel(r.status)}</Badge></TD><TD className="text-xs text-muted">{fmtDate(r.dueDate)}</TD>
            <TD><form action={updateRiskStatusAction.bind(null, r.id)} className="flex items-center gap-1"><Select name="status" defaultValue={r.status} className="h-7 w-28 text-xs">{["IDENTIFIED", "ASSESSED", "MITIGATING", "ACCEPTED", "CLOSED"].map((s) => <option key={s} value={s}>{enumLabel(s)}</option>)}</Select><Input name="residualScore" type="number" min={0} max={100} placeholder="resid." className="h-7 w-16 text-xs" /><Button size="sm" variant="ghost" type="submit">Save</Button></form></TD></TR>)}
        </TBody></Table>
      </div>
    </>
  );
}
