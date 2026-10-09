import { db } from "@/lib/db";

/** Default remediation deadline for automatically created risks: CRITICAL (≥80) 30 days, HIGH (60–79) 45 days, others 90 days. */
export function defaultDueDate(score: number, from: Date = new Date()): Date {
  const days = score >= 80 ? 30 : score >= 60 ? 45 : 90;
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
}

export const OPEN_RISK_STATUSES = ["IDENTIFIED", "ASSESSED", "MITIGATING"] as const;

export function isOverdue(r: { dueDate: Date | null; status: string }, now: Date = new Date()): boolean {
  return !!r.dueDate && r.dueDate < now && (OPEN_RISK_STATUSES as readonly string[]).includes(r.status);
}

export function daysOverdue(due: Date, now: Date = new Date()): number {
  return Math.max(1, Math.floor((now.getTime() - due.getTime()) / (24 * 60 * 60 * 1000)));
}

/** Fill missing due dates on open risks from their score, counted from the risk's creation date. Returns the number updated. */
export async function backfillRiskDueDates(orgId?: string): Promise<number> {
  const rows = await db.risk.findMany({ where: { ...(orgId ? { orgId } : {}), dueDate: null, status: { in: [...OPEN_RISK_STATUSES] } }, select: { id: true, score: true, createdAt: true } });
  for (const r of rows) await db.risk.update({ where: { id: r.id }, data: { dueDate: defaultDueDate(r.score, r.createdAt) } });
  return rows.length;
}

/**
 * Create one open follow-up task per overdue open risk (idempotent), and close those tasks when the risk is
 * no longer open or no longer overdue. Called on dashboard / risk-register loads.
 */
export async function ensureOverdueRiskTasks(orgId: string): Promise<{ overdue: number; created: number }> {
  const now = new Date();
  await backfillRiskDueDates(orgId);
  const risks = await db.risk.findMany({ where: { orgId, status: { in: [...OPEN_RISK_STATUSES] }, dueDate: { lt: now } }, include: { system: { select: { code: true } } } });
  const existing = await db.task.findMany({ where: { orgId, relatedType: "risk", status: { in: ["OPEN", "IN_PROGRESS"] }, title: { startsWith: "Overdue risk " } }, select: { id: true, relatedId: true } });
  const byRisk = new Map(existing.map((t) => [t.relatedId, t.id]));
  let created = 0;
  for (const r of risks) {
    if (byRisk.has(r.id)) continue;
    await db.task.create({ data: { orgId, title: `Overdue risk ${r.code}: ${r.title}`, description: `${r.system.code} · due ${r.dueDate!.toISOString().slice(0, 10)} · score ${Math.round(r.score)}`, assigneeId: r.ownerId ?? undefined, dueDate: r.dueDate, status: "OPEN", relatedType: "risk", relatedId: r.id } });
    created++;
  }
  // Auto-close follow-ups whose risk is no longer overdue/open
  const stillOverdue = new Set(risks.map((r) => r.id));
  const stale = existing.filter((t) => t.relatedId && !stillOverdue.has(t.relatedId)).map((t) => t.id);
  if (stale.length) await db.task.updateMany({ where: { id: { in: stale } }, data: { status: "DONE" } });
  return { overdue: risks.length, created };
}
