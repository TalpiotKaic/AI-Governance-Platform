// One prioritized, role-aware to-do list gathered from every module, so users do not need to know where things live.
import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/auth";
import { userCan } from "@/lib/auth";
import { OPEN_RISK_STATUSES } from "@/lib/risks/due";
import { REVIEW_NOTICE_DAYS } from "@/lib/documents";
import { isInternalSaas } from "@/lib/systems/progress";
import { BASELINE_KEYS } from "@/lib/baseline-documents";

export type Todo = {
  id: string;
  priority: 1 | 2 | 3;            // 1 urgent · 2 important · 3 when possible
  title: string;                   // translation key with {placeholders}
  vars?: Record<string, string>;
  why: string;                     // translation key: why it matters
  href: string;
  action: string;                  // translation key for the button
  due?: Date | null;
};
const DAY = 24 * 60 * 60 * 1000;

export async function buildTodos(user: SessionUser): Promise<Todo[]> {
  const orgId = user.orgId, now = new Date(), soon = new Date(now.getTime() + REVIEW_NOTICE_DAYS * DAY);
  const todos: Todo[] = [];
  const [systems, overdueRisks, docs, approvals, unassessedVendors, expiredEv, myTasks] = await Promise.all([
    db.aiSystem.findMany({ where: { orgId }, select: { id: true, code: true, name: true, type: true, customerFacing: true, automatedDecision: true, euAiActCategory: true,
      risks: { where: { status: "IDENTIFIED" }, select: { id: true } },
      runs: { where: { status: "COMPLETED" }, orderBy: { finishedAt: "desc" }, take: 1, select: { finishedAt: true, createdAt: true } },
      changeEvents: { where: { requiresRetest: true }, select: { createdAt: true } } } }),
    db.risk.findMany({ where: { orgId, status: { in: [...OPEN_RISK_STATUSES] }, dueDate: { lt: now } }, orderBy: { dueDate: "asc" }, select: { id: true, code: true, title: true, dueDate: true } }),
    db.policy.findMany({ where: { orgId, status: { in: ["DRAFT", "IN_REVIEW", "ACTIVE", "EXPIRED"] } }, select: { id: true, title: true, version: true, status: true, ownerId: true, submittedById: true, nextReviewDate: true, templateKey: true } }),
    db.approval.count({ where: { orgId, decision: "PENDING" } }),
    db.vendor.findMany({ where: { orgId, assessedAt: null, systems: { some: {} } }, select: { id: true, name: true } }),
    db.evidence.count({ where: { orgId, status: "EXPIRED", policyId: null, systemId: { not: null } } }),
    db.task.findMany({ where: { orgId, assigneeId: user.id, status: { in: ["OPEN", "IN_PROGRESS"] }, NOT: { relatedType: { in: ["risk", "document"] } } }, select: { id: true, title: true, dueDate: true } }),
  ]);

  if (userCan(user, "risks.write")) {
    for (const r of overdueRisks.slice(0, 5)) todos.push({ id: `risk-${r.id}`, priority: 1, title: "Overdue risk {code}: {title}", vars: { code: r.code, title: r.title }, why: "Past its remediation due date.", href: `/risks?edit=${r.id}`, action: "Update risk", due: r.dueDate });
    if (overdueRisks.length > 5) todos.push({ id: "risk-more", priority: 1, title: "{n} more overdue risks", vars: { n: String(overdueRisks.length - 5) }, why: "Past their remediation due dates.", href: "/risks", action: "Open risk register" });
    for (const s of systems.filter((x) => x.risks.length)) todos.push({ id: `assess-${s.id}`, priority: 2, title: "Assess {n} new risk(s) for {system}", vars: { n: String(s.risks.length), system: `${s.code} ${s.name}` }, why: "Generated from the intake; confirm L·S, mitigation and owner.", href: `/systems/${s.id}?tab=risks`, action: "Review risks" });
  }
  const canWriteDocs = userCan(user, "policies.write"), canReviewDocs = userCan(user, "policies.review");
  for (const d of docs) {
    const own = d.ownerId === user.id || d.submittedById === user.id;
    if (d.status === "EXPIRED" && (canWriteDocs || canReviewDocs)) todos.push({ id: `doc-${d.id}`, priority: 1, title: "Document expired: {title}", vars: { title: `${d.title} v${d.version}` }, why: "No longer counts as evidence for any system.", href: `/policies/${d.id}`, action: "Review document", due: d.nextReviewDate });
    else if (d.status === "IN_REVIEW" && canReviewDocs && (!own || user.role === "ADMIN")) todos.push({ id: `doc-${d.id}`, priority: 2, title: "Document review requested: {title}", vars: { title: `${d.title} v${d.version}` }, why: "Approval puts it in force as organisation-wide evidence.", href: `/policies/${d.id}`, action: "Review document" });
    else if (d.status === "ACTIVE" && d.nextReviewDate && d.nextReviewDate <= soon && (canWriteDocs || canReviewDocs)) todos.push({ id: `doc-${d.id}`, priority: 2, title: "Document review due: {title}", vars: { title: `${d.title} v${d.version}` }, why: "Confirm it is unchanged or issue a new version before the review date.", href: `/policies/${d.id}`, action: "Review document", due: d.nextReviewDate });
    else if (d.status === "DRAFT" && d.ownerId === user.id) todos.push({ id: `doc-${d.id}`, priority: 3, title: "Finish draft: {title}", vars: { title: `${d.title} v${d.version}` }, why: "Request review once the text or file is ready.", href: `/policies/${d.id}`, action: "Open draft" });
  }
  if (canWriteDocs) {
    const have = new Set(docs.map((d) => d.templateKey).filter(Boolean));
    const missing = BASELINE_KEYS.filter((k) => !have.has(k)).length;
    if (missing) todos.push({ id: "baseline", priority: 2, title: "Create the baseline document set ({n} missing)", vars: { n: String(missing) }, why: "Six starter documents cover the organisation-level requirements of every framework at once.", href: "/policies#baseline", action: "Create drafts" });
  }
  if (userCan(user, "approvals.decide") && approvals) todos.push({ id: "approvals", priority: 2, title: "Decide {n} pending approval(s)", vars: { n: String(approvals) }, why: "Deployments and risk acceptances wait for a decision.", href: "/approvals", action: "Open approvals" });
  if (userCan(user, "evaluations.run")) {
    for (const s of systems) {
      const last = s.runs[0] ? (s.runs[0].finishedAt ?? s.runs[0].createdAt) : null;
      if (last && s.changeEvents.some((c) => c.createdAt > last)) todos.push({ id: `retest-${s.id}`, priority: 1, title: "Re-test {system} after a recorded change", vars: { system: `${s.code} ${s.name}` }, why: "Earlier test results no longer prove the changed system.", href: `/systems/${s.id}?tab=evaluations`, action: "Run recommended evaluation" });
      else if (!last && !isInternalSaas(s)) todos.push({ id: `eval-${s.id}`, priority: 2, title: "Run the recommended evaluation for {system}", vars: { system: `${s.code} ${s.name}` }, why: "Tests verify the technical controls automatically.", href: `/systems/${s.id}?tab=evaluations`, action: "Run recommended evaluation" });
    }
  }
  if (userCan(user, "systems.write")) for (const v of unassessedVendors) todos.push({ id: `vendor-${v.id}`, priority: 3, title: "Assess vendor {name}", vars: { name: v.name }, why: "Vendor due diligence is evidence for third-party management (HC-15).", href: `/vendors?edit=${v.id}`, action: "Assess vendor" });
  if (userCan(user, "evidence.write") && expiredEv) todos.push({ id: "evidence", priority: 3, title: "{n} expired system evidence item(s)", vars: { n: String(expiredEv) }, why: "Renew the document or re-run the tests.", href: "/evidence", action: "Open evidence" });
  for (const t of myTasks) todos.push({ id: `task-${t.id}`, priority: t.dueDate && t.dueDate < now ? 1 : 3, title: "Task: {title}", vars: { title: t.title }, why: "Assigned to you.", href: "/approvals", action: "Open task", due: t.dueDate });
  return todos.sort((a, b) => a.priority - b.priority || (a.due?.getTime() ?? Infinity) - (b.due?.getTime() ?? Infinity));
}
