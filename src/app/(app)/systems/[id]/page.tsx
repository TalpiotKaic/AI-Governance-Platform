import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, FlaskConical, FileText, ClipboardList } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge, toneForStatus, toneForTier } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/progress";
import { Tabs } from "@/components/ui/tabs";
import { Table, TBody, TD, TH, THead, TR, EmptyState } from "@/components/ui/table";
import { Input, Select } from "@/components/ui/input";
import { VerdictBadge, SeverityBadge } from "@/components/domain/verdict";
import { enumLabel, fmtDate, fmtAgo } from "@/lib/utils";
import { recordChangeAction, updateControlStatusAction } from "../actions";
import { Suspense } from "react";

export default async function SystemDetailPage(props: PageProps<"/systems/[id]">) {
  const user = await requireUser();
  const { id } = await props.params;
  const sp = await props.searchParams;
  const tab = typeof sp.tab === "string" ? sp.tab : "overview";
  const s = await db.aiSystem.findFirst({ where: { id, orgId: user.orgId }, include: { owner: true, technicalOwner: true, models: true, agentProfile: true, datasets: { include: { dataset: true } }, vendors: { include: { vendor: true } }, risks: { orderBy: { score: "desc" }, include: { owner: true } }, runs: { orderBy: { createdAt: "desc" } }, plans: { orderBy: { createdAt: "desc" } }, evidence: { orderBy: { createdAt: "desc" }, include: { links: { include: { control: true } } } }, reports: { orderBy: { createdAt: "desc" } }, changeEvents: { orderBy: { createdAt: "desc" } }, findings: { where: { status: { in: ["OPEN", "MITIGATING"] } }, orderBy: { severity: "desc" } }, incidents: true } });
  if (!s) notFound();
  const controls = await db.control.findMany({ orderBy: { sortOrder: "asc" }, include: { impls: { where: { systemId: id } }, requirements: { include: { requirement: { include: { framework: true } } } }, testMethods: { include: { testMethod: true } }, evidenceLinks: { where: { evidence: { systemId: id, status: "VALID" } } } } });
  const approvals = await db.approval.findMany({ where: { orgId: user.orgId, subjectId: id }, orderBy: { requestedAt: "asc" }, include: { approver: true } });
  const tools = (s.agentProfile?.tools as { name: string; riskLevel?: string; allowed?: boolean; permissions?: string[]; requiresApproval?: boolean }[] | undefined) ?? [];
  const retestNeeded = s.changeEvents.some((c) => c.requiresRetest && (!s.runs[0] || c.createdAt > (s.runs[0].finishedAt ?? s.runs[0].createdAt)));
  const tabs = [
    { key: "overview", label: "Overview" }, ...(s.agentProfile ? [{ key: "agent", label: "Agent card" }] : []), { key: "risks", label: "Risks", count: s.risks.length }, { key: "controls", label: "Controls", count: controls.filter((c) => c.impls[0] && c.impls[0].status !== "NOT_STARTED").length },
    { key: "evaluations", label: "Evaluations", count: s.runs.length }, { key: "evidence", label: "Evidence", count: s.evidence.length }, { key: "reports", label: "Reports", count: s.reports.length }, { key: "changes", label: "Changes & approvals" },
  ];
  return (
    <>
      <PageHeader title={`${s.code} · ${s.name}`} crumbs={[{ label: "AI Inventory", href: "/systems" }, { label: s.code }]} description={s.purpose ?? s.description ?? undefined}
        actions={<>
          <Link href={`/plans/new?systemId=${s.id}`}><Button variant="outline"><ClipboardList className="h-4 w-4" /> New plan</Button></Link>
          <Link href={`/evaluations/new?systemId=${s.id}`}><Button variant="outline"><FlaskConical className="h-4 w-4" /> New evaluation</Button></Link>
          <Link href={`/reports/new?systemId=${s.id}`}><Button variant="outline"><FileText className="h-4 w-4" /> Generate report</Button></Link>
          <Link href={`/systems/${s.id}/edit`}><Button><Pencil className="h-4 w-4" /> Edit</Button></Link>
        </>} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge>{enumLabel(s.type)}</Badge><Badge tone={toneForStatus(s.lifecycleStage)}>{enumLabel(s.lifecycleStage)}</Badge><Badge tone={toneForTier(s.riskTier)}>Tier: {enumLabel(s.riskTier)}</Badge><Badge tone={s.euAiActCategory === "HIGH_RISK" ? "danger" : "neutral"}>EU AI Act: {enumLabel(s.euAiActCategory)}</Badge>
        {s.usesPersonalData && <Badge tone="info">Personal data</Badge>}{s.usesSensitiveData && <Badge tone="danger">Sensitive data</Badge>}{s.customerFacing && <Badge tone="accent">Customer-facing</Badge>}{s.automatedDecision && <Badge tone="warning">Automated decisions</Badge>}
        {retestNeeded && <Badge tone="danger">Re-test required (change recorded)</Badge>}
      </div>
      <Suspense><Tabs tabs={tabs} /></Suspense>

      {tab === "overview" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card><CardHeader><CardTitle>Assurance</CardTitle><CardDescription>Latest run-derived score</CardDescription></CardHeader><CardContent className="flex items-center gap-4"><ScoreRing value={s.assuranceScore} size={88} label="Assurance score" /><div className="text-sm"><p>Intake risk score: <span className="font-medium tabular-nums">{s.riskScore ?? "—"}</span></p><p>Open findings: <span className="font-medium">{s.findings.length}</span></p><p>Runs: <span className="font-medium">{s.runs.length}</span>{s.runs[0] && <> · last <VerdictBadge verdict={s.runs[0].verdict} /></>}</p></div></CardContent></Card>
          <Card className="lg:col-span-2"><CardHeader><CardTitle>Profile</CardTitle></CardHeader><CardContent>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {[["Sector", s.sector], ["Deployment context", s.deploymentContext], ["Intended users", s.intendedUsers], ["Affected persons", s.affectedPersons], ["Human oversight", s.humanOversight], ["Annex III area", s.euAiActAnnexIIIArea], ["Geographies", s.geographies.join(", ")], ["Owner", s.owner?.name], ["Technical owner", s.technicalOwner?.name], ["Tags", s.tags.join(", ")]].map(([k, v]) => (
                <div key={k as string} className="border-b border-border/60 pb-1.5"><dt className="text-[11px] font-medium uppercase tracking-wide text-muted">{k}</dt><dd>{v || "—"}</dd></div>
              ))}
            </dl>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Models</CardTitle></CardHeader><CardContent>{s.models.length ? <ul className="space-y-2 text-sm">{s.models.map((m) => <li key={m.id} className="rounded-md border border-border px-3 py-2"><div className="font-medium">{m.provider} · {m.name}{m.version && <span className="text-muted"> v{m.version}</span>}</div><div className="text-xs text-muted">{enumLabel(m.hostingType)}{m.modality ? ` · ${m.modality}` : ""}</div></li>)}</ul> : <p className="text-sm text-muted">No model recorded.</p>}</CardContent></Card>
          <Card><CardHeader><CardTitle>Datasets</CardTitle></CardHeader><CardContent>{s.datasets.length ? <ul className="space-y-2 text-sm">{s.datasets.map((d) => <li key={d.datasetId} className="rounded-md border border-border px-3 py-2"><div className="font-medium">{d.dataset.name}{d.dataset.version && <span className="text-muted"> {d.dataset.version}</span>}</div><div className="text-xs text-muted">{d.purpose} · {d.dataset.containsPii ? "contains PII" : "no PII"} · {d.dataset.sensitivity}</div></li>)}</ul> : <p className="text-sm text-muted">No datasets linked.</p>}</CardContent></Card>
          <Card><CardHeader><CardTitle>Vendors</CardTitle></CardHeader><CardContent>{s.vendors.length ? <ul className="space-y-2 text-sm">{s.vendors.map((v) => <li key={v.vendorId} className="rounded-md border border-border px-3 py-2"><div className="font-medium">{v.vendor.name}</div><div className="text-xs text-muted">{v.role} · {v.vendor.serviceType} · risk {v.vendor.riskScore ?? "—"}/100</div></li>)}</ul> : <p className="text-sm text-muted">No vendors linked.</p>}</CardContent></Card>
        </div>
      )}

      {tab === "agent" && s.agentProfile && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card><CardHeader><CardTitle>Agent card</CardTitle></CardHeader><CardContent><dl className="space-y-2 text-sm">{[["Framework", s.agentProfile.framework], ["Autonomy", enumLabel(s.agentProfile.autonomyLevel)], ["Kill switch", s.agentProfile.killSwitch ? "Yes" : "No"], ["Budget cap", s.agentProfile.maxBudgetUsd ? `$${s.agentProfile.maxBudgetUsd}` : "—"], ["Memory", s.agentProfile.memoryDesc], ["Guardrails", s.agentProfile.guardrails]].map(([k, v]) => <div key={k as string}><dt className="text-[11px] uppercase tracking-wide text-muted">{k}</dt><dd>{v || "—"}</dd></div>)}</dl></CardContent></Card>
          <Card className="lg:col-span-2"><CardHeader><CardTitle>Tool allow-list ({tools.length})</CardTitle><CardDescription>Risk level and permission scope per tool. Disallowed tools are blocked by policy enforcement during evaluation and flagged if the agent attempts them.</CardDescription></CardHeader><CardContent className="px-0 pb-0">
            <Table><THead><TR><TH>Tool</TH><TH>Risk</TH><TH>Allowed</TH><TH>Approval</TH><TH>Permissions</TH></TR></THead><TBody>{tools.map((t) => <TR key={t.name}><TD className="font-mono text-xs">{t.name}</TD><TD><Badge tone={t.riskLevel === "critical" || t.riskLevel === "high" ? "danger" : t.riskLevel === "medium" ? "warning" : "success"}>{t.riskLevel ?? "—"}</Badge></TD><TD><Badge tone={t.allowed === false ? "danger" : "success"}>{t.allowed === false ? "Blocked" : "Allowed"}</Badge></TD><TD className="text-xs">{t.requiresApproval ? "Human approval" : "—"}</TD><TD className="text-xs text-muted">{(t.permissions ?? []).join(", ") || "—"}</TD></TR>)}</TBody></Table>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Data sources</CardTitle></CardHeader><CardContent><ul className="space-y-1 text-sm">{((s.agentProfile.dataSources as { name: string; type?: string; containsPii?: boolean }[]) ?? []).map((d, i) => <li key={i}>{d.name}{d.type && <span className="text-muted"> · {d.type}</span>}{d.containsPii && <Badge tone="info" className="ml-2">PII</Badge>}</li>)}</ul></CardContent></Card>
          <Card><CardHeader><CardTitle>Sub-agents</CardTitle></CardHeader><CardContent><ul className="space-y-1 text-sm">{((s.agentProfile.subAgents as { name: string; role?: string }[]) ?? []).map((d, i) => <li key={i}>{d.name}{d.role && <span className="text-muted"> — {d.role}</span>}</li>)}{((s.agentProfile.subAgents as unknown[]) ?? []).length === 0 && <li className="text-muted">None</li>}</ul></CardContent></Card>
          <Card><CardHeader><CardTitle>MCP servers</CardTitle></CardHeader><CardContent><ul className="space-y-1 text-sm">{((s.agentProfile.mcpServers as { name: string; endpoint?: string; tools?: string[] }[]) ?? []).map((d, i) => <li key={i}><span className="font-mono text-xs">{d.name}</span>{d.endpoint && <span className="text-muted"> · {d.endpoint}</span>}{d.tools?.length ? <div className="text-xs text-muted">{d.tools.join(", ")}</div> : null}</li>)}{((s.agentProfile.mcpServers as unknown[]) ?? []).length === 0 && <li className="text-muted">None</li>}</ul></CardContent></Card>
        </div>
      )}

      {tab === "risks" && (
        <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Risk register — {s.code}</CardTitle><CardDescription>Score = likelihood × 1 + severity × 3, scaled to 100. HIGH/CRITICAL test findings register risks automatically.</CardDescription></div><Link href={`/risks/new?systemId=${s.id}`}><Button size="sm" variant="outline">Add risk</Button></Link></CardHeader><CardContent className="px-0 pb-0">
          {s.risks.length ? <Table><THead><TR><TH>Code</TH><TH>Risk</TH><TH>Dimension</TH><TH>L</TH><TH>S</TH><TH>Score</TH><TH>Status</TH><TH>Source</TH><TH>Owner</TH><TH>Due</TH></TR></THead><TBody>{s.risks.map((r) => <TR key={r.id}><TD className="font-mono text-xs text-muted">{r.code}</TD><TD><div className="font-medium">{r.title}</div>{r.mitigation && <div className="text-xs text-muted">Mitigation: {r.mitigation}</div>}</TD><TD><Badge>{enumLabel(r.dimension)}</Badge></TD><TD className="tabular-nums">{r.likelihood}</TD><TD className="tabular-nums">{r.severity}</TD><TD><Badge tone={toneForTier(r.score >= 80 ? "CRITICAL" : r.score >= 60 ? "HIGH" : r.score >= 35 ? "MEDIUM" : "LOW")}>{Math.round(r.score)}</Badge></TD><TD><Badge tone={toneForStatus(r.status)}>{enumLabel(r.status)}</Badge></TD><TD className="text-xs">{enumLabel(r.source)}</TD><TD className="text-xs">{r.owner?.name ?? "—"}</TD><TD className="text-xs text-muted">{fmtDate(r.dueDate)}</TD></TR>)}</TBody></Table> : <div className="p-5"><EmptyState title="No risks" /></div>}
        </CardContent></Card>
      )}

      {tab === "controls" && (
        <Card><CardHeader><CardTitle>Harmonized controls (28)</CardTitle><CardDescription>One control satisfies requirements across ISO/IEC 42001, EU AI Act, NIST AI RMF and the KR AI Basic Act. Controls with test methods are VERIFIED automatically when linked test metrics pass.</CardDescription></CardHeader><CardContent className="px-0 pb-0">
          <Table><THead><TR><TH>Control</TH><TH>Maps to</TH><TH>Test methods</TH><TH>Evidence</TH><TH>Status</TH><TH>Update</TH></TR></THead><TBody>
            {controls.map((c) => { const impl = c.impls[0]; const fws = [...new Set(c.requirements.map((r) => enumLabel(r.requirement.framework.code)))]; return (
              <TR key={c.id}><TD><div className="font-medium"><span className="font-mono text-xs text-muted">{c.code}</span> {c.name}</div><div className="text-xs text-muted">{c.category}</div></TD><TD className="text-xs">{fws.join(" · ")}<div className="text-muted">{c.requirements.length} requirements</div></TD><TD className="text-xs">{c.testMethods.map((t) => t.testMethod.code).join(", ") || <span className="text-muted">documentary</span>}</TD><TD className="tabular-nums">{c.evidenceLinks.length}</TD><TD><Badge tone={toneForStatus(impl?.status ?? "NOT_STARTED")}>{enumLabel(impl?.status ?? "NOT_STARTED")}</Badge>{impl?.lastVerifiedAt && <div className="text-[10px] text-muted">verified {fmtDate(impl.lastVerifiedAt)}</div>}</TD>
                <TD><form action={updateControlStatusAction.bind(null, s.id, c.id)} className="flex items-center gap-1"><Select name="status" defaultValue={impl?.status ?? "NOT_STARTED"} className="h-7 w-36 text-xs"><option value="NOT_STARTED">Not started</option><option value="IN_PROGRESS">In progress</option><option value="IMPLEMENTED">Implemented</option><option value="VERIFIED">Verified</option><option value="NOT_APPLICABLE">N/A</option></Select><Button size="sm" variant="ghost" type="submit">Save</Button></form></TD></TR>); })}
          </TBody></Table>
        </CardContent></Card>
      )}

      {tab === "evaluations" && (
        <div className="space-y-4">
          <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Evaluation plans</CardTitle><CardDescription>NIST AI 200-3 worksheets B.1–B.5</CardDescription></div><Link href={`/plans/new?systemId=${s.id}`}><Button size="sm" variant="outline">New plan</Button></Link></CardHeader><CardContent className="px-0 pb-0">{s.plans.length ? <Table><THead><TR><TH>Plan</TH><TH>Status</TH><TH>Created</TH></TR></THead><TBody>{s.plans.map((p) => <TR key={p.id}><TD><Link href={`/plans/${p.id}`} className="hover:underline">{p.name}</Link></TD><TD><Badge tone={toneForStatus(p.status)}>{enumLabel(p.status)}</Badge></TD><TD className="text-xs text-muted">{fmtDate(p.createdAt)}</TD></TR>)}</TBody></Table> : <div className="p-5"><EmptyState title="No evaluation plans" /></div>}</CardContent></Card>
          <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Evaluation runs</CardTitle></div><Link href={`/evaluations/new?systemId=${s.id}`}><Button size="sm">New evaluation</Button></Link></CardHeader><CardContent className="px-0 pb-0">{s.runs.length ? <Table><THead><TR><TH>Run</TH><TH>Mode</TH><TH>Status</TH><TH>Verdict</TH><TH>Score</TH><TH>Finished</TH></TR></THead><TBody>{s.runs.map((r) => <TR key={r.id}><TD><Link href={`/evaluations/${r.id}`} className="hover:underline"><span className="font-mono text-xs text-muted">{r.code}</span> {r.name}</Link></TD><TD><Badge tone={r.mode === "LIVE" ? "accent" : "warning"}>{r.mode}</Badge></TD><TD><Badge tone={toneForStatus(r.status)}>{enumLabel(r.status)}</Badge></TD><TD><VerdictBadge verdict={r.verdict} /></TD><TD className="tabular-nums">{(r.summary as { assuranceScore?: number }).assuranceScore ?? "—"}</TD><TD className="text-xs text-muted">{fmtAgo(r.finishedAt ?? r.createdAt)}</TD></TR>)}</TBody></Table> : <div className="p-5"><EmptyState title="No evaluation runs yet" /></div>}</CardContent></Card>
          {s.findings.length > 0 && <Card><CardHeader><CardTitle>Open findings ({s.findings.length})</CardTitle></CardHeader><CardContent className="px-0 pb-0"><Table><THead><TR><TH>Code</TH><TH>Finding</TH><TH>Category</TH><TH>Severity</TH><TH>Status</TH></TR></THead><TBody>{s.findings.map((f) => <TR key={f.id}><TD className="font-mono text-xs text-muted">{f.code}</TD><TD><Link href={`/evaluations/${f.runId}?tab=findings`} className="hover:underline">{f.title}</Link></TD><TD><Badge>{enumLabel(f.category)}</Badge></TD><TD><SeverityBadge severity={f.severity} /></TD><TD><Badge tone={toneForStatus(f.status)}>{enumLabel(f.status)}</Badge></TD></TR>)}</TBody></Table></CardContent></Card>}
        </div>
      )}

      {tab === "evidence" && (
        <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Evidence ({s.evidence.length})</CardTitle><CardDescription>Generated from test runs, uploaded documents and attestations, each linked to controls.</CardDescription></div><Link href={`/evidence/new?systemId=${s.id}`}><Button size="sm" variant="outline">Add evidence</Button></Link></CardHeader><CardContent className="px-0 pb-0">
          {s.evidence.length ? <Table><THead><TR><TH>Type</TH><TH>Title</TH><TH>Source</TH><TH>Controls</TH><TH>Status</TH><TH>Date</TH></TR></THead><TBody>{s.evidence.map((e) => <TR key={e.id}><TD><Badge>{enumLabel(e.type)}</Badge></TD><TD><Link href={`/evidence/${e.id}`} className="hover:underline">{e.title}</Link>{e.description && <div className="text-xs text-muted">{e.description}</div>}</TD><TD><Badge tone={e.source === "GENERATED" ? "primary" : e.source === "ATTESTATION" ? "accent" : "neutral"}>{enumLabel(e.source)}</Badge></TD><TD className="text-xs">{e.links.map((l) => l.control?.code).filter(Boolean).join(", ") || "—"}</TD><TD><Badge tone={toneForStatus(e.status)}>{enumLabel(e.status)}</Badge></TD><TD className="text-xs text-muted">{fmtDate(e.createdAt)}</TD></TR>)}</TBody></Table> : <div className="p-5"><EmptyState title="No evidence yet" /></div>}
        </CardContent></Card>
      )}

      {tab === "reports" && (
        <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Reports & evidence packs</CardTitle></div><Link href={`/reports/new?systemId=${s.id}`}><Button size="sm">Generate</Button></Link></CardHeader><CardContent className="px-0 pb-0">
          {s.reports.length ? <Table><THead><TR><TH>Code</TH><TH>Report</TH><TH>Version</TH><TH>Status</TH><TH>Created</TH><TH>Issued</TH></TR></THead><TBody>{s.reports.map((r) => <TR key={r.id}><TD className="font-mono text-xs text-muted">{r.code}</TD><TD><Link href={`/reports/${r.id}`} className="hover:underline">{enumLabel(r.type)}</Link></TD><TD>v{r.version}</TD><TD><Badge tone={toneForStatus(r.status)}>{enumLabel(r.status)}</Badge></TD><TD className="text-xs text-muted">{fmtDate(r.createdAt)}</TD><TD className="text-xs text-muted">{fmtDate(r.issuedAt)}</TD></TR>)}</TBody></Table> : <div className="p-5"><EmptyState title="No reports generated" /></div>}
        </CardContent></Card>
      )}

      {tab === "changes" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card><CardHeader><CardTitle>Deployment approval workflow</CardTitle><CardDescription>Stages are generated from the risk tier at intake.</CardDescription></CardHeader><CardContent>{approvals.length ? <ol className="space-y-2">{approvals.map((a, i) => <li key={a.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"><div><span className="mr-2 text-xs text-muted">{i + 1}.</span>{a.stage}<div className="text-xs text-muted">{a.approver?.name ?? "Unassigned"}{a.decidedAt ? ` · ${fmtDate(a.decidedAt)}` : ""}{a.comment ? ` · ${a.comment}` : ""}</div></div><Badge tone={toneForStatus(a.decision)}>{enumLabel(a.decision)}</Badge></li>)}</ol> : <p className="text-sm text-muted">No approvals.</p>}<Link href="/approvals" className="mt-3 inline-block text-xs text-primary hover:underline">Go to approvals →</Link></CardContent></Card>
          <Card><CardHeader><CardTitle>Change events → re-test triggers</CardTitle><CardDescription>Recording a change expires test-derived evidence and reverts VERIFIED controls until the affected categories are re-run.</CardDescription></CardHeader><CardContent>
            <form action={recordChangeAction.bind(null, s.id)} className="mb-4 grid grid-cols-1 gap-2 rounded-md border border-border p-3 sm:grid-cols-[160px_1fr_auto]">
              <Select name="type" defaultValue="PROMPT"><option value="MODEL_VERSION">Model version</option><option value="PROMPT">Prompt</option><option value="TOOL">Tool</option><option value="DATA_SOURCE">Data source</option><option value="CONFIGURATION">Configuration</option><option value="VENDOR">Vendor</option></Select>
              <Input name="description" placeholder="What changed?" required /><Button type="submit" size="md">Record change</Button>
            </form>
            {s.changeEvents.length ? <ul className="space-y-2 text-sm">{s.changeEvents.map((c) => <li key={c.id} className="rounded-md border border-border px-3 py-2"><div className="flex items-center justify-between"><span><Badge className="mr-2">{enumLabel(c.type)}</Badge>{c.description}</span><span className="text-xs text-muted">{fmtDate(c.createdAt)}</span></div><div className="mt-1 text-xs text-muted">Re-test: {c.retestCategories.map(enumLabel).join(", ") || "—"}</div></li>)}</ul> : <p className="text-sm text-muted">No change events.</p>}
          </CardContent></Card>
          <Card className="lg:col-span-2"><CardHeader><CardTitle>Incidents</CardTitle></CardHeader><CardContent>{s.incidents.length ? <ul className="space-y-2 text-sm">{s.incidents.map((i) => <li key={i.id} className="rounded-md border border-border px-3 py-2"><div className="flex items-center gap-2"><span className="font-mono text-xs text-muted">{i.code}</span><SeverityBadge severity={i.severity} /><Badge tone={toneForStatus(i.status)}>{enumLabel(i.status)}</Badge><span className="font-medium">{i.title}</span></div>{i.actions && <p className="mt-1 text-xs text-muted">Actions: {i.actions}</p>}</li>)}</ul> : <p className="text-sm text-muted">No incidents.</p>}</CardContent></Card>
        </div>
      )}
    </>
  );
}
