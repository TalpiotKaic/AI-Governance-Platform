import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge, toneForStatus } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { enumLabel, fmtDate } from "@/lib/utils";

export const metadata = { title: "Reports & Packs" };

const GROUPS: [string, string[]][] = [["Evaluation & verification", ["EVALUATION_REPORT", "VERIFICATION_REPORT", "NIST_ARIA_EVALUATION_REPORT"]], ["Regulatory evidence packs", ["ISO_42001_EVIDENCE_PACK", "EU_AI_ACT_EVIDENCE_PACK", "NIST_AI_RMF_EVIDENCE_PACK", "KR_AI_BASIC_ACT_EVIDENCE_PACK"]], ["Living records", ["AI_PASSPORT"]]];

export default async function ReportsPage() {
  const user = await requireUser();
  const reports = await db.report.findMany({ where: { orgId: user.orgId }, orderBy: { createdAt: "desc" }, include: { system: true, createdBy: true, approver: true } });
  return (
    <>
      <PageHeader title="Reports & Evidence Packs" description="Evaluation reports, formal verification (test) reports with tester/reviewer/approver sign-off, NIST ARIA worksheet reports, framework evidence packs (ISO/IEC 42001, EU AI Act, NIST AI RMF, KR AI Basic Act) and the living AI Passport. Reports are versioned; issuing one supersedes the previous version." actions={<Link href="/reports/new"><Button><Plus className="h-4 w-4" /> Generate</Button></Link>} />
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">{GROUPS.map(([g, types]) => <Card key={g}><CardContent className="pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted">{g}</p><ul className="mt-2 space-y-1 text-sm">{types.map((t) => <li key={t} className="flex items-center justify-between"><span>{enumLabel(t)}</span><span className="tabular-nums text-muted">{reports.filter((r) => r.type === t).length}</span></li>)}</ul></CardContent></Card>)}</div>
      <div className="rounded-lg border border-border bg-surface"><Table><THead><TR><TH>Code</TH><TH>Report</TH><TH>System</TH><TH>Version</TH><TH>Status</TH><TH>Created</TH><TH>Approver</TH><TH>Issued</TH></TR></THead><TBody>
        {reports.map((r) => <TR key={r.id}><TD className="font-mono text-xs text-muted">{r.code}</TD><TD><Link href={`/reports/${r.id}`} className="font-medium hover:underline">{enumLabel(r.type)}</Link><div className="text-xs text-muted">{r.title}</div></TD><TD className="text-xs">{r.system.code}</TD><TD>v{r.version}</TD><TD><Badge tone={toneForStatus(r.status)}>{enumLabel(r.status)}</Badge></TD><TD className="text-xs text-muted">{fmtDate(r.createdAt)} · {r.createdBy?.name}</TD><TD className="text-xs">{r.approver?.name ?? "—"}</TD><TD className="text-xs text-muted">{fmtDate(r.issuedAt)}</TD></TR>)}
      </TBody></Table></div>
    </>
  );
}
