import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { enumLabel } from "@/lib/utils";
import { generateReportAction } from "../actions";
import { REPORT_TITLES } from "@/lib/reports/service";

export default async function NewReportPage(props: PageProps<"/reports/new">) {
  const user = await requireUser();
  const sp = await props.searchParams;
  const systems = await db.aiSystem.findMany({ where: { orgId: user.orgId }, orderBy: { code: "asc" } });
  const systemId = typeof sp.systemId === "string" ? sp.systemId : systems[0]?.id;
  const runs = await db.evaluationRun.findMany({ where: { orgId: user.orgId, systemId, status: "COMPLETED" }, orderBy: { createdAt: "desc" } });
  const plans = await db.evaluationPlan.findMany({ where: { orgId: user.orgId, systemId }, orderBy: { createdAt: "desc" } });
  const users = await db.user.findMany({ where: { orgId: user.orgId } });
  const type = typeof sp.type === "string" ? sp.type : "EVALUATION_REPORT";
  const runId = typeof sp.runId === "string" ? sp.runId : runs[0]?.id;
  return (
    <>
      <PageHeader title="Generate report" crumbs={[{ label: "Reports & Packs", href: "/reports" }, { label: "Generate" }]} description="Reports are built from platform records (runs, risks, controls, evidence). Change the system to reload its runs and plans." />
      <Card><CardHeader><CardTitle>Report parameters</CardTitle><CardDescription>Evidence packs need no run; evaluation & verification reports need at least one completed run; the ARIA report needs a plan.</CardDescription></CardHeader><CardContent>
        <form className="mb-4 flex items-end gap-2"><Field label="AI system"><Select name="systemId" defaultValue={systemId} className="w-80">{systems.map((s) => <option key={s.id} value={s.id}>{s.code} · {s.name}</option>)}</Select></Field><input type="hidden" name="type" value={type} /><Button type="submit" variant="outline">Load</Button></form>
        <form action={generateReportAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input type="hidden" name="systemId" value={systemId} />
          <Field label="Report type"><Select name="type" defaultValue={type}>{Object.entries(REPORT_TITLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
          <Field label="Evaluation run(s)" hint="Hold Ctrl/Cmd to select several (verification report). Ignored for evidence packs and passport."><select name="runIds" multiple defaultValue={runId ? [runId] : []} className="h-28 w-full rounded-md border border-border bg-surface px-2 text-sm">{runs.map((r) => <option key={r.id} value={r.id}>{r.code} · {r.name} ({r.mode}, {enumLabel(r.verdict)})</option>)}</select></Field>
          <Field label="Evaluation plan (ARIA report)"><Select name="planId" defaultValue={typeof sp.planId === "string" ? sp.planId : ""}><option value="">—</option>{plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></Field>
          <div className="grid grid-cols-3 gap-2 md:col-span-2"><Field label="Tester (signature block)"><Input name="tester" defaultValue={users.find((u) => u.role === "TESTER")?.name ?? user.name} /></Field><Field label="Reviewer"><Input name="reviewer" defaultValue={users.find((u) => u.role === "REVIEWER")?.name ?? ""} /></Field><Field label="Approver"><Input name="approver" defaultValue={users.find((u) => u.role === "APPROVER")?.name ?? ""} /></Field></div>
          <div className="flex justify-end md:col-span-2"><Button type="submit">Generate</Button></div>
        </form>
      </CardContent></Card>
    </>
  );
}
