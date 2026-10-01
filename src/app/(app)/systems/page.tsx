import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge, toneForStatus, toneForTier } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR, EmptyState } from "@/components/ui/table";
import { enumLabel, fmtAgo } from "@/lib/utils";

export const metadata = { title: "AI Inventory" };

export default async function SystemsPage() {
  const user = await requireUser();
  const systems = await db.aiSystem.findMany({ where: { orgId: user.orgId }, orderBy: { code: "asc" }, include: { owner: true, models: true, _count: { select: { risks: true, runs: true, evidence: true } } } });
  return (
    <>
      <PageHeader title="AI Inventory" description="Every AI system, model and agent in scope — the top-level object that risks, controls, tests, evidence and reports attach to." actions={<Link href="/systems/new"><Button><Plus className="h-4 w-4" /> Register AI system</Button></Link>} />
      {systems.length === 0 ? <EmptyState title="No AI systems registered" description="Register your first AI system to start the intake → risk → control → test → evidence chain." action={<Link href="/systems/new"><Button>Register AI system</Button></Link>} /> : (
        <div className="rounded-lg border border-border bg-surface">
          <Table>
            <THead><TR><TH>Code</TH><TH>System</TH><TH>Type</TH><TH>Stage</TH><TH>EU AI Act</TH><TH>Tier</TH><TH>Assurance</TH><TH>Risks</TH><TH>Runs</TH><TH>Evidence</TH><TH>Owner</TH><TH>Updated</TH></TR></THead>
            <TBody>
              {systems.map((s) => (
                <TR key={s.id}>
                  <TD className="font-mono text-xs text-muted">{s.code}</TD>
                  <TD><Link href={`/systems/${s.id}`} className="font-medium hover:underline">{s.name}</Link><div className="text-xs text-muted">{s.models.map((m) => `${m.provider} ${m.name}`).join(", ") || s.sector}</div></TD>
                  <TD><Badge>{enumLabel(s.type)}</Badge></TD>
                  <TD><Badge tone={toneForStatus(s.lifecycleStage)}>{enumLabel(s.lifecycleStage)}</Badge></TD>
                  <TD className="text-xs">{enumLabel(s.euAiActCategory)}</TD>
                  <TD><Badge tone={toneForTier(s.riskTier)}>{enumLabel(s.riskTier)}</Badge></TD>
                  <TD className="tabular-nums">{s.assuranceScore === null ? <span className="text-muted">—</span> : <span className={s.assuranceScore >= 80 ? "text-success" : s.assuranceScore >= 60 ? "text-warning" : "text-danger"}>{Math.round(s.assuranceScore)}</span>}</TD>
                  <TD className="tabular-nums">{s._count.risks}</TD>
                  <TD className="tabular-nums">{s._count.runs}</TD>
                  <TD className="tabular-nums">{s._count.evidence}</TD>
                  <TD className="text-xs">{s.owner?.name ?? "—"}</TD>
                  <TD className="text-xs text-muted">{fmtAgo(s.updatedAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </>
  );
}
