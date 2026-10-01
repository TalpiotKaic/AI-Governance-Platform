import { requireUser, hasRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, toneForStatus } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { enumLabel, fmtDate } from "@/lib/utils";
import { createTaskAction, decideApprovalAction, setTaskStatusAction } from "./actions";

export const metadata = { title: "Approvals & Tasks" };

export default async function ApprovalsPage() {
  const user = await requireUser();
  const approvals = await db.approval.findMany({ where: { orgId: user.orgId }, orderBy: [{ decision: "desc" }, { requestedAt: "asc" }], include: { approver: true } });
  const tasks = await db.task.findMany({ where: { orgId: user.orgId }, orderBy: [{ status: "asc" }, { dueDate: "asc" }], include: { assignee: true } });
  const users = await db.user.findMany({ where: { orgId: user.orgId } });
  const audit = await db.auditLog.findMany({ where: { orgId: user.orgId }, orderBy: { createdAt: "desc" }, take: 25, include: { actor: true } });
  const canDecide = hasRole(user, "REVIEWER");
  const pending = approvals.filter((a) => a.decision === "PENDING"), decided = approvals.filter((a) => a.decision !== "PENDING");
  return (
    <>
      <PageHeader title="Approvals, Tasks & Audit Trail" description="Multi-stage review/approval (technical, privacy & security, legal, executive) generated from intake risk tier; every decision becomes an approval record (evidence) and an audit-trail entry." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Pending approvals ({pending.length})</CardTitle><CardDescription>{canDecide ? "You can decide on these stages." : "Reviewer/Approver roles can decide."}</CardDescription></CardHeader><CardContent className="space-y-2">
          {pending.map((a) => <div key={a.id} className="rounded-md border border-border p-3 text-sm"><div className="flex items-center justify-between"><div><div className="font-medium">{a.stage}</div><div className="text-xs text-muted">{a.subjectLabel} · {enumLabel(a.subjectType)} · requested {fmtDate(a.requestedAt)}{a.approver ? ` · assigned ${a.approver.name}` : ""}</div></div><Badge tone="neutral">Pending</Badge></div>
            {canDecide && <form action={decideApprovalAction.bind(null, a.id)} className="mt-2 flex items-center gap-2"><Input name="comment" placeholder="Comment (optional)" className="h-8 text-xs" /><Button size="sm" name="decision" value="APPROVED" type="submit">Approve</Button><Button size="sm" variant="danger" name="decision" value="REJECTED" type="submit">Reject</Button></form>}</div>)}
          {pending.length === 0 && <p className="text-sm text-muted">Nothing pending.</p>}
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Tasks ({tasks.filter((t) => t.status !== "DONE" && t.status !== "CANCELLED").length} open)</CardTitle></CardHeader><CardContent>
          <form action={createTaskAction} className="mb-3 grid grid-cols-1 gap-2 rounded-md border border-border p-3 sm:grid-cols-[1fr_140px_130px_auto]"><Input name="title" placeholder="New task…" required className="h-8 text-xs" /><Select name="assigneeId" className="h-8 text-xs"><option value="">Unassigned</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</Select><Input name="dueDate" type="date" className="h-8 text-xs" /><Button size="sm" type="submit">Add</Button></form>
          <ul className="space-y-1.5">{tasks.map((t) => <li key={t.id} className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"><div><div className={t.status === "DONE" ? "line-through text-muted" : "font-medium"}>{t.title}</div><div className="text-xs text-muted">{t.assignee?.name ?? "Unassigned"}{t.dueDate ? ` · due ${fmtDate(t.dueDate)}` : ""}{t.description ? ` · ${t.description}` : ""}</div></div><form action={setTaskStatusAction.bind(null, t.id)} className="flex items-center gap-1"><Select name="status" defaultValue={t.status} className="h-7 w-28 text-xs">{["OPEN", "IN_PROGRESS", "DONE", "CANCELLED"].map((s) => <option key={s} value={s}>{enumLabel(s)}</option>)}</Select><Button size="sm" variant="ghost" type="submit">Save</Button></form></li>)}</ul>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Decided ({decided.length})</CardTitle></CardHeader><CardContent className="px-0 pb-0"><Table><THead><TR><TH>Stage</TH><TH>Subject</TH><TH>Decision</TH><TH>By</TH><TH>When</TH></TR></THead><TBody>{decided.map((a) => <TR key={a.id}><TD>{a.stage}</TD><TD className="text-xs">{a.subjectLabel}</TD><TD><Badge tone={toneForStatus(a.decision)}>{enumLabel(a.decision)}</Badge>{a.comment && <div className="text-[11px] text-muted">{a.comment}</div>}</TD><TD className="text-xs">{a.approver?.name}</TD><TD className="text-xs text-muted">{fmtDate(a.decidedAt)}</TD></TR>)}</TBody></Table></CardContent></Card>
        <Card><CardHeader><CardTitle>Audit trail (latest 25)</CardTitle><CardDescription>Who did what, when — immutable log for internal audit and regulator requests.</CardDescription></CardHeader><CardContent className="px-0 pb-0"><Table><THead><TR><TH>When</TH><TH>Actor</TH><TH>Action</TH><TH>Summary</TH></TR></THead><TBody>{audit.map((l) => <TR key={l.id}><TD className="text-xs text-muted">{fmtDate(l.createdAt, true)}</TD><TD className="text-xs">{l.actor?.name ?? "system"}</TD><TD><Badge>{l.action}</Badge></TD><TD className="text-xs">{l.summary}</TD></TR>)}</TBody></Table></CardContent></Card>
      </div>
    </>
  );
}
