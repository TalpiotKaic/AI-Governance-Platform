import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, FlaskConical, FileText, ClipboardList } from "lucide-react";
import { requireUser, userCan } from "@/lib/auth";
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
import { fmtDate, fmtAgo} from "@/lib/utils";
import { recordChangeAction, updateControlStatusAction } from "../actions";
import { Suspense } from "react";
import { getI18n } from "@/lib/i18n/server";

export default async function SystemDetailPage(props: PageProps<"/systems/[id]">) {
  const { t, L } = await getI18n();
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
          {userCan(user, "plans.write") && <Link href={`/plans/new?systemId=${s.id}`}><Button variant="outline"><ClipboardList className="h-4 w-4" /> {t("New plan")}</Button></Link>}
          {userCan(user, "evaluations.run") && <Link href={`/evaluations/new?systemId=${s.id}`}><Button variant="outline"><FlaskConical className="h-4 w-4" /> {t("New evaluation")}</Button></Link>}
          {userCan(user, "reports.generate") && <Link href={`/reports/new?systemId=${s.id}`}><Button variant="outline"><FileText className="h-4 w-4" /> {t("Generate report")}</Button></Link>}
          {userCan(user, "systems.write") && <Link href={`/systems/${s.id}/edit`}><Button><Pencil className="h-4 w-4" /> {t("Edit")}</Button></Link>}
        </>} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge>{L(s.type)}</Badge><Badge tone={toneForStatus(s.lifecycleStage)}>{L(s.lifecycleStage)}</Badge><Badge tone={toneForTier(s.riskTier)}>Tier: {L(s.riskTier)}</Badge><Badge tone={s.euAiActCategory === "HIGH_RISK" ? "danger" : "neutral"}>EU AI Act: {L(s.euAiActCategory)}</Badge>
        {s.usesPersonalData && <Badge tone="info">{t("Personal data")}</Badge>}{s.usesSensitiveData && <Badge tone="danger">{t("Sensitive data")}</Badge>}{s.customerFacing && <Badge tone="accent">{t("Customer-facing")}</Badge>}{s.automatedDecision && <Badge tone="warning">{t("Automated decisions")}</Badge>}
        {retestNeeded && <Badge tone="danger">{t("Re-test required (change recorded)")}</Badge>}
      </div>
      <Suspense><Tabs tabs={tabs} /></Suspense>

      {tab === "overview" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card><CardHeader><CardTitle>{t("Assurance")}</CardTitle><CardDescription>{t("Latest run-derived score")}</CardDescription></CardHeader><CardContent className="flex items-center gap-4"><ScoreRing value={s.assuranceScore} size={88} label={t("Assurance score")} /><div className="text-sm"><p>{t("Intake risk score:")} <span className="font-medium tabular-nums">{s.riskScore ?? "—"}</span></p><p>{t("Open findings:")} <span className="font-medium">{s.findings.length}</span></p><p>{t("Runs:")} <span className="font-medium">{s.runs.length}</span>{s.runs[0] && <> · last <VerdictBadge verdict={s.runs[0].verdict} /></>}</p></div></CardContent></Card>
          <Card className="lg:col-span-2"><CardHeader><CardTitle>{t("Profile")}</CardTitle></CardHeader><CardContent>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {[[t("Sector"), s.sector], [t("Deployment context"), s.deploymentContext], [t("Intended users"), s.intendedUsers], [t("Affected persons"), s.affectedPersons], [t("Human oversight"), s.humanOversight], ["Annex III area", s.euAiActAnnexIIIArea], ["Geographies", s.geographies.join(", ")], [t("Owner"), s.owner?.name], ["Technical owner", s.technicalOwner?.name], ["Tags", s.tags.join(", ")]].map(([k, v]) => (
                <div key={k as string} className="border-b border-border/60 pb-1.5"><dt className="text-[11px] font-medium uppercase tracking-wide text-muted">{k}</dt><dd>{v || "—"}</dd></div>
              ))}
            </dl>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>{t("Models")}</CardTitle></CardHeader><CardContent>{s.models.length ? <ul className="space-y-2 text-sm">{s.models.map((m) => <li key={m.id} className="rounded-md border border-border px-3 py-2"><div className="font-medium">{m.provider} · {m.name}{m.version && <span className="text-muted"> v{m.version}</span>}</div><div className="text-xs text-muted">{L(m.hostingType)}{m.modality ? ` · ${m.modality}` : ""}</div></li>)}</ul> : <p className="text-sm text-muted">{t("No model recorded.")}</p>}</CardContent></Card>
          <Card><CardHeader><CardTitle>{t("Datasets")}</CardTitle></CardHeader><CardContent>{s.datasets.length ? <ul className="space-y-2 text-sm">{s.datasets.map((d) => <li key={d.datasetId} className="rounded-md border border-border px-3 py-2"><div className="font-medium">{d.dataset.name}{d.dataset.version && <span className="text-muted"> {d.dataset.version}</span>}</div><div className="text-xs text-muted">{d.purpose} · {d.dataset.containsPii ? "contains PII" : "no PII"} · {d.dataset.sensitivity}</div></li>)}</ul> : <p className="text-sm text-muted">{t("No datasets linked.")}</p>}</CardContent></Card>
          <Card><CardHeader><CardTitle>{t("Vendors")}</CardTitle></CardHeader><CardContent>{s.vendors.length ? <ul className="space-y-2 text-sm">{s.vendors.map((v) => <li key={v.vendorId} className="rounded-md border border-border px-3 py-2"><div className="font-medium">{v.vendor.name}</div><div className="text-xs text-muted">{v.role} · {v.vendor.serviceType} · risk {v.vendor.riskScore ?? "—"}/100</div></li>)}</ul> : <p className="text-sm text-muted">{t("No vendors linked.")}</p>}</CardContent></Card>
        </div>
      )}

      {tab === "agent" && s.agentProfile && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card><CardHeader><CardTitle>{t("Agent card")}</CardTitle></CardHeader><CardContent><dl className="space-y-2 text-sm">{[[t("Framework"), s.agentProfile.framework], [t("Autonomy"), L(s.agentProfile.autonomyLevel)], [t("Kill switch"), s.agentProfile.killSwitch ? "Yes" : "No"], [t("Budget cap"), s.agentProfile.maxBudgetUsd ? `$${s.agentProfile.maxBudgetUsd}` : "—"], ["Memory", s.agentProfile.memoryDesc], ["Guardrails", s.agentProfile.guardrails]].map(([k, v]) => <div key={k as string}><dt className="text-[11px] uppercase tracking-wide text-muted">{k}</dt><dd>{v || "—"}</dd></div>)}</dl></CardContent></Card>
          <Card className="lg:col-span-2"><CardHeader><CardTitle>Tool allow-list ({tools.length})</CardTitle><CardDescription>{t("Risk level and permission scope per tool. Disallowed tools are blocked by policy enforcement during evaluation and flagged if the agent attempts them.")}</CardDescription></CardHeader><CardContent className="px-0 pb-0">
            <Table><THead><TR><TH>{t("Tool")}</TH><TH>{t("Risk")}</TH><TH>{t("Allowed")}</TH><TH>{t("Approval")}</TH><TH>{t("Permissions")}</TH></TR></THead><TBody>{tools.map((tool) => <TR key={tool.name}><TD className="font-mono text-xs">{tool.name}</TD><TD><Badge tone={tool.riskLevel === "critical" || tool.riskLevel === "high" ? "danger" : tool.riskLevel === "medium" ? "warning" : "success"}>{tool.riskLevel ?? "—"}</Badge></TD><TD><Badge tone={tool.allowed === false ? "danger" : "success"}>{tool.allowed === false ? t("Blocked") : t("Allowed")}</Badge></TD><TD className="text-xs">{tool.requiresApproval ? t("Human approval") : "—"}</TD><TD className="text-xs text-muted">{(tool.permissions ?? []).join(", ") || "—"}</TD></TR>)}</TBody></Table>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>{t("Data sources")}</CardTitle></CardHeader><CardContent><ul className="space-y-1 text-sm">{((s.agentProfile.dataSources as { name: string; type?: string; containsPii?: boolean }[]) ?? []).map((d, i) => <li key={i}>{d.name}{d.type && <span className="text-muted"> · {d.type}</span>}{d.containsPii && <Badge tone="info" className="ml-2">{t("PII")}</Badge>}</li>)}</ul></CardContent></Card>
          <Card><CardHeader><CardTitle>{t("Sub-agents")}</CardTitle></CardHeader><CardContent><ul className="space-y-1 text-sm">{((s.agentProfile.subAgents as { name: string; role?: string }[]) ?? []).map((d, i) => <li key={i}>{d.name}{d.role && <span className="text-muted"> — {d.role}</span>}</li>)}{((s.agentProfile.subAgents as unknown[]) ?? []).length === 0 && <li className="text-muted">{t("None")}</li>}</ul></CardContent></Card>
          <Card><CardHeader><CardTitle>{t("MCP servers")}</CardTitle></CardHeader><CardContent><ul className="space-y-1 text-sm">{((s.agentProfile.mcpServers as { name: string; endpoint?: string; tools?: string[] }[]) ?? []).map((d, i) => <li key={i}><span className="font-mono text-xs">{d.name}</span>{d.endpoint && <span className="text-muted"> · {d.endpoint}</span>}{d.tools?.length ? <div className="text-xs text-muted">{d.tools.join(", ")}</div> : null}</li>)}{((s.agentProfile.mcpServers as unknown[]) ?? []).length === 0 && <li className="text-muted">{t("None")}</li>}</ul></CardContent></Card>
        </div>
      )}

      {tab === "risks" && (
        <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Risk register — {s.code}</CardTitle><CardDescription>{t("Score = likelihood × 1 + severity × 3, scaled to 100. HIGH/CRITICAL test findings register risks automatically.")}</CardDescription></div>{userCan(user, "risks.write") && <Link href={`/risks/new?systemId=${s.id}`}><Button size="sm" variant="outline">{t("Add risk")}</Button></Link>}</CardHeader><CardContent className="px-0 pb-0">
          {s.risks.length ? <Table><THead><TR><TH>{t("Code")}</TH><TH>{t("Risk")}</TH><TH>{t("Dimension")}</TH><TH>L</TH><TH>S</TH><TH>{t("Score")}</TH><TH>{t("Status")}</TH><TH>{t("Source")}</TH><TH>{t("Owner")}</TH><TH>{t("Due")}</TH></TR></THead><TBody>{s.risks.map((r) => <TR key={r.id}><TD className="font-mono text-xs text-muted">{r.code}</TD><TD><div className="font-medium">{r.title}</div>{r.mitigation && <div className="text-xs text-muted">Mitigation: {r.mitigation}</div>}</TD><TD><Badge>{L(r.dimension)}</Badge></TD><TD className="tabular-nums">{r.likelihood}</TD><TD className="tabular-nums">{r.severity}</TD><TD><Badge tone={toneForTier(r.score >= 80 ? "CRITICAL" : r.score >= 60 ? "HIGH" : r.score >= 35 ? "MEDIUM" : "LOW")}>{Math.round(r.score)}</Badge></TD><TD><Badge tone={toneForStatus(r.status)}>{L(r.status)}</Badge></TD><TD className="text-xs">{L(r.source)}</TD><TD className="text-xs">{r.owner?.name ?? "—"}</TD><TD className="text-xs text-muted">{fmtDate(r.dueDate)}</TD></TR>)}</TBody></Table> : <div className="p-5"><EmptyState title={t("No risks")} /></div>}
        </CardContent></Card>
      )}

      {tab === "controls" && (
        <Card><CardHeader><CardTitle>{t("Harmonized controls (28)")}</CardTitle><CardDescription>{t("One control satisfies requirements across ISO/IEC 42001, EU AI Act, NIST AI RMF and the KR AI Basic Act. Controls with test methods are VERIFIED automatically when linked test metrics pass.")}</CardDescription></CardHeader><CardContent className="px-0 pb-0">
          <Table><THead><TR><TH>{t("Control")}</TH><TH>{t("Maps to")}</TH><TH>{t("Test methods")}</TH><TH>{t("Evidence")}</TH><TH>{t("Status")}</TH><TH>{t("Update")}</TH></TR></THead><TBody>
            {controls.map((c) => { const impl = c.impls[0]; const fws = [...new Set(c.requirements.map((r) => L(r.requirement.framework.code)))]; return (
              <TR key={c.id}><TD><div className="font-medium"><span className="font-mono text-xs text-muted">{c.code}</span> {c.name}</div><div className="text-xs text-muted">{c.category}</div></TD><TD className="text-xs">{fws.join(" · ")}<div className="text-muted">{c.requirements.length} requirements</div></TD><TD className="text-xs">{c.testMethods.map((t) => t.testMethod.code).join(", ") || <span className="text-muted">{t("documentary")}</span>}</TD><TD className="tabular-nums">{c.evidenceLinks.length}</TD><TD><Badge tone={toneForStatus(impl?.status ?? "NOT_STARTED")}>{L(impl?.status ?? "NOT_STARTED")}</Badge>{impl?.lastVerifiedAt && <div className="text-[10px] text-muted">verified {fmtDate(impl.lastVerifiedAt)}</div>}</TD>
                <TD>{userCan(user, "systems.write") ? <form action={updateControlStatusAction.bind(null, s.id, c.id)} className="flex items-center gap-1"><Select name="status" defaultValue={impl?.status ?? "NOT_STARTED"} className="h-7 w-36 text-xs"><option value="NOT_STARTED">{t("Not started")}</option><option value="IN_PROGRESS">{t("In progress")}</option><option value="IMPLEMENTED">{t("Implemented")}</option><option value="VERIFIED">{t("Verified")}</option><option value="NOT_APPLICABLE">{t("N/A")}</option></Select><Button size="sm" variant="ghost" type="submit">{t("Save")}</Button></form> : <Badge>{L(impl?.status ?? "NOT_STARTED")}</Badge>}</TD></TR>); })}
          </TBody></Table>
        </CardContent></Card>
      )}

      {tab === "evaluations" && (
        <div className="space-y-4">
          <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>{t("Evaluation plans")}</CardTitle><CardDescription>{t("NIST AI 200-3 worksheets B.1–B.5")}</CardDescription></div>{userCan(user, "plans.write") && <Link href={`/plans/new?systemId=${s.id}`}><Button size="sm" variant="outline">{t("New plan")}</Button></Link>}</CardHeader><CardContent className="px-0 pb-0">{s.plans.length ? <Table><THead><TR><TH>{t("Plan")}</TH><TH>{t("Status")}</TH><TH>{t("Created")}</TH></TR></THead><TBody>{s.plans.map((p) => <TR key={p.id}><TD><Link href={`/plans/${p.id}`} className="hover:underline">{p.name}</Link></TD><TD><Badge tone={toneForStatus(p.status)}>{L(p.status)}</Badge></TD><TD className="text-xs text-muted">{fmtDate(p.createdAt)}</TD></TR>)}</TBody></Table> : <div className="p-5"><EmptyState title={t("No evaluation plans")} /></div>}</CardContent></Card>
          <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>{t("Evaluation runs")}</CardTitle></div>{userCan(user, "evaluations.run") && <Link href={`/evaluations/new?systemId=${s.id}`}><Button size="sm">{t("New evaluation")}</Button></Link>}</CardHeader><CardContent className="px-0 pb-0">{s.runs.length ? <Table><THead><TR><TH>{t("Run")}</TH><TH>{t("Mode")}</TH><TH>{t("Status")}</TH><TH>{t("Verdict")}</TH><TH>{t("Score")}</TH><TH>{t("Finished")}</TH></TR></THead><TBody>{s.runs.map((r) => <TR key={r.id}><TD><Link href={`/evaluations/${r.id}`} className="hover:underline"><span className="font-mono text-xs text-muted">{r.code}</span> {r.name}</Link></TD><TD><Badge tone={r.mode === "LIVE" ? "accent" : "warning"}>{r.mode}</Badge></TD><TD><Badge tone={toneForStatus(r.status)}>{L(r.status)}</Badge></TD><TD><VerdictBadge verdict={r.verdict} /></TD><TD className="tabular-nums">{(r.summary as { assuranceScore?: number }).assuranceScore ?? "—"}</TD><TD className="text-xs text-muted">{fmtAgo(r.finishedAt ?? r.createdAt)}</TD></TR>)}</TBody></Table> : <div className="p-5"><EmptyState title={t("No evaluation runs yet")} /></div>}</CardContent></Card>
          {s.findings.length > 0 && <Card><CardHeader><CardTitle>Open findings ({s.findings.length})</CardTitle></CardHeader><CardContent className="px-0 pb-0"><Table><THead><TR><TH>{t("Code")}</TH><TH>{t("Finding")}</TH><TH>{t("Category")}</TH><TH>{t("Severity")}</TH><TH>{t("Status")}</TH></TR></THead><TBody>{s.findings.map((f) => <TR key={f.id}><TD className="font-mono text-xs text-muted">{f.code}</TD><TD><Link href={`/evaluations/${f.runId}?tab=findings`} className="hover:underline">{f.title}</Link></TD><TD><Badge>{L(f.category)}</Badge></TD><TD><SeverityBadge severity={f.severity} /></TD><TD><Badge tone={toneForStatus(f.status)}>{L(f.status)}</Badge></TD></TR>)}</TBody></Table></CardContent></Card>}
        </div>
      )}

      {tab === "evidence" && (
        <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>Evidence ({s.evidence.length})</CardTitle><CardDescription>{t("Generated from test runs, uploaded documents and attestations, each linked to controls.")}</CardDescription></div>{userCan(user, "evidence.write") && <Link href={`/evidence/new?systemId=${s.id}`}><Button size="sm" variant="outline">{t("Add evidence")}</Button></Link>}</CardHeader><CardContent className="px-0 pb-0">
          {s.evidence.length ? <Table><THead><TR><TH>{t("Type")}</TH><TH>{t("Title")}</TH><TH>{t("Source")}</TH><TH>{t("Controls")}</TH><TH>{t("Status")}</TH><TH>{t("Date")}</TH></TR></THead><TBody>{s.evidence.map((e) => <TR key={e.id}><TD><Badge>{L(e.type)}</Badge></TD><TD><Link href={`/evidence/${e.id}`} className="hover:underline">{e.title}</Link>{e.description && <div className="text-xs text-muted">{e.description}</div>}</TD><TD><Badge tone={e.source === "GENERATED" ? "primary" : e.source === "ATTESTATION" ? "accent" : "neutral"}>{L(e.source)}</Badge></TD><TD className="text-xs">{e.links.map((l) => l.control?.code).filter(Boolean).join(", ") || "—"}</TD><TD><Badge tone={toneForStatus(e.status)}>{L(e.status)}</Badge></TD><TD className="text-xs text-muted">{fmtDate(e.createdAt)}</TD></TR>)}</TBody></Table> : <div className="p-5"><EmptyState title={t("No evidence yet")} /></div>}
        </CardContent></Card>
      )}

      {tab === "reports" && (
        <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle>{t("Reports & evidence packs")}</CardTitle></div><Link href={`/reports/new?systemId=${s.id}`}><Button size="sm">{t("Generate")}</Button></Link></CardHeader><CardContent className="px-0 pb-0">
          {s.reports.length ? <Table><THead><TR><TH>{t("Code")}</TH><TH>{t("Report")}</TH><TH>{t("Version")}</TH><TH>{t("Status")}</TH><TH>{t("Created")}</TH><TH>{t("Issued")}</TH></TR></THead><TBody>{s.reports.map((r) => <TR key={r.id}><TD className="font-mono text-xs text-muted">{r.code}</TD><TD><Link href={`/reports/${r.id}`} className="hover:underline">{L(r.type)}</Link></TD><TD>v{r.version}</TD><TD><Badge tone={toneForStatus(r.status)}>{L(r.status)}</Badge></TD><TD className="text-xs text-muted">{fmtDate(r.createdAt)}</TD><TD className="text-xs text-muted">{fmtDate(r.issuedAt)}</TD></TR>)}</TBody></Table> : <div className="p-5"><EmptyState title={t("No reports generated")} /></div>}
        </CardContent></Card>
      )}

      {tab === "changes" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card><CardHeader><CardTitle>{t("Deployment approval workflow")}</CardTitle><CardDescription>{t("Stages are generated from the risk tier at intake.")}</CardDescription></CardHeader><CardContent>{approvals.length ? <ol className="space-y-2">{approvals.map((a, i) => <li key={a.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"><div><span className="mr-2 text-xs text-muted">{i + 1}.</span>{a.stage}<div className="text-xs text-muted">{a.approver?.name ?? "Unassigned"}{a.decidedAt ? ` · ${fmtDate(a.decidedAt)}` : ""}{a.comment ? ` · ${a.comment}` : ""}</div></div><Badge tone={toneForStatus(a.decision)}>{L(a.decision)}</Badge></li>)}</ol> : <p className="text-sm text-muted">{t("No approvals.")}</p>}<Link href="/approvals" className="mt-3 inline-block text-xs text-primary hover:underline">{t("Go to approvals →")}</Link></CardContent></Card>
          <Card><CardHeader><CardTitle>{t("Change events → re-test triggers")}</CardTitle><CardDescription>{t("Recording a change expires test-derived evidence and reverts VERIFIED controls until the affected categories are re-run.")}</CardDescription></CardHeader><CardContent>
            {userCan(user, "systems.write") && <form action={recordChangeAction.bind(null, s.id)} className="mb-4 grid grid-cols-1 gap-2 rounded-md border border-border p-3 sm:grid-cols-[160px_1fr_auto]">
              <Select name="type" defaultValue="PROMPT"><option value="MODEL_VERSION">{t("Model version")}</option><option value="PROMPT">{t("Prompt")}</option><option value="TOOL">{t("Tool")}</option><option value="DATA_SOURCE">{t("Data source")}</option><option value="CONFIGURATION">{t("Configuration")}</option><option value="VENDOR">{t("Vendor")}</option></Select>
              <Input name="description" placeholder={t("What changed?")} required /><Button type="submit" size="md">{t("Record change")}</Button>
            </form>}
            {s.changeEvents.length ? <ul className="space-y-2 text-sm">{s.changeEvents.map((c) => <li key={c.id} className="rounded-md border border-border px-3 py-2"><div className="flex items-center justify-between"><span><Badge className="mr-2">{L(c.type)}</Badge>{c.description}</span><span className="text-xs text-muted">{fmtDate(c.createdAt)}</span></div><div className="mt-1 text-xs text-muted">Re-test: {c.retestCategories.map((x) => L(x)).join(", ") || "—"}</div></li>)}</ul> : <p className="text-sm text-muted">{t("No change events.")}</p>}
          </CardContent></Card>
          <Card className="lg:col-span-2"><CardHeader><CardTitle>{t("Incidents")}</CardTitle></CardHeader><CardContent>{s.incidents.length ? <ul className="space-y-2 text-sm">{s.incidents.map((i) => <li key={i.id} className="rounded-md border border-border px-3 py-2"><div className="flex items-center gap-2"><span className="font-mono text-xs text-muted">{i.code}</span><SeverityBadge severity={i.severity} /><Badge tone={toneForStatus(i.status)}>{L(i.status)}</Badge><span className="font-medium">{i.title}</span></div>{i.actions && <p className="mt-1 text-xs text-muted">Actions: {i.actions}</p>}</li>)}</ul> : <p className="text-sm text-muted">{t("No incidents.")}</p>}</CardContent></Card>
        </div>
      )}
    </>
  );
}
