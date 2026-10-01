import { requireUser, hasRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, toneForStatus } from "@/components/ui/badge";
import { Field, Input, Textarea } from "@/components/ui/input";
import { enumLabel, fmtDate } from "@/lib/utils";
import { createPolicyAction, setPolicyStatusAction } from "./actions";

export const metadata = { title: "Policies" };

export default async function PoliciesPage() {
  const user = await requireUser();
  const policies = await db.policy.findMany({ where: { orgId: user.orgId }, orderBy: [{ status: "asc" }, { updatedAt: "desc" }], include: { owner: true } });
  const canEdit = hasRole(user, "GOVERNANCE_OWNER");
  return (
    <>
      <PageHeader title="Policies" description="AI policy library (ISO/IEC 42001 cl. 5.2, A.2.2) and internal standards. Activating a policy records versioned policy evidence linked to HC-01." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">{policies.map((p) => <Card key={p.id}><CardContent className="pt-4"><div className="flex flex-wrap items-center gap-2"><Badge tone={toneForStatus(p.status)}>{enumLabel(p.status)}</Badge><span className="font-medium">{p.title}</span><span className="text-xs text-muted">v{p.version} · {p.owner?.name}{p.effectiveDate ? ` · effective ${fmtDate(p.effectiveDate)}` : ""}</span><span className="flex-1" />{canEdit && p.status !== "ACTIVE" && <form action={setPolicyStatusAction.bind(null, p.id, "ACTIVE")}><Button size="sm" type="submit">Activate</Button></form>}{canEdit && p.status === "ACTIVE" && <form action={setPolicyStatusAction.bind(null, p.id, "RETIRED")}><Button size="sm" variant="ghost" type="submit">Retire</Button></form>}</div>{p.content && <p className="mt-2 text-sm text-muted">{p.content}</p>}</CardContent></Card>)}</div>
        <Card><CardHeader><CardTitle>New policy</CardTitle><CardDescription>Templates: AI Policy, Risk Assessment Procedure, Agent Tool-Use Standard, Change-triggered Re-evaluation, Incident Communication Plan.</CardDescription></CardHeader><CardContent>{canEdit ? <form action={createPolicyAction} className="space-y-3"><Field label="Title"><Input name="title" required /></Field><Field label="Version"><Input name="version" defaultValue="1.0" /></Field><Field label="Summary / content"><Textarea name="content" /></Field><Button type="submit" className="w-full">Create draft</Button></form> : <p className="text-sm text-muted">Governance Owner or Admin role required.</p>}</CardContent></Card>
      </div>
    </>
  );
}
