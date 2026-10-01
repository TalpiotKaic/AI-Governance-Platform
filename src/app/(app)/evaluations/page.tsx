import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge, toneForStatus } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR, EmptyState } from "@/components/ui/table";
import { VerdictBadge } from "@/components/domain/verdict";
import { Progress } from "@/components/ui/progress";
import { enumLabel, fmtAgo } from "@/lib/utils";

export const metadata = { title: "Evaluation Runs" };

export default async function EvaluationsPage() {
  const user = await requireUser();
  const runs = await db.evaluationRun.findMany({ where: { orgId: user.orgId }, orderBy: { createdAt: "desc" }, include: { system: true, plan: true, createdBy: true, _count: { select: { sessions: true, findings: true } } } });
  return (
    <>
      <PageHeader title="Evaluation Runs" description="Executions of model, red-team and user-testing scenarios against a target (live API, HTTP Evaluation API, or the deterministic demo target). Each run produces metrics, findings, risks, control verification and evidence." actions={<Link href="/evaluations/new"><Button><Plus className="h-4 w-4" /> New evaluation</Button></Link>} />
      {runs.length === 0 ? <EmptyState title="No evaluation runs" action={<Link href="/evaluations/new"><Button>New evaluation</Button></Link>} /> : (
        <div className="rounded-lg border border-border bg-surface"><Table><THead><TR><TH>Run</TH><TH>System</TH><TH>Plan</TH><TH>Mode</TH><TH>Status</TH><TH>Verdict</TH><TH>Score</TH><TH>Sessions</TH><TH>Findings</TH><TH>By</TH><TH>When</TH></TR></THead><TBody>
          {runs.map((r) => <TR key={r.id}><TD><Link href={`/evaluations/${r.id}`} className="font-medium hover:underline"><span className="font-mono text-xs text-muted">{r.code}</span> {r.name}</Link></TD><TD className="text-xs">{r.system.code}</TD><TD className="text-xs text-muted">{r.plan?.name ?? "ad hoc"}</TD><TD><Badge tone={r.mode === "LIVE" ? "accent" : "warning"}>{r.mode}</Badge></TD><TD>{r.status === "RUNNING" ? <div className="w-24"><Progress value={r.progress} /><span className="text-[10px] text-muted">{r.progress}%</span></div> : <Badge tone={toneForStatus(r.status)}>{enumLabel(r.status)}</Badge>}</TD><TD><VerdictBadge verdict={r.verdict} /></TD><TD className="tabular-nums">{(r.summary as { assuranceScore?: number }).assuranceScore ?? "—"}</TD><TD className="tabular-nums">{r._count.sessions}</TD><TD className="tabular-nums">{r._count.findings}</TD><TD className="text-xs">{r.createdBy?.name}</TD><TD className="text-xs text-muted">{fmtAgo(r.createdAt)}</TD></TR>)}
        </TBody></Table></div>
      )}
    </>
  );
}
