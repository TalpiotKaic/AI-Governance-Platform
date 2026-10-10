// Organisation-level governance documents ("Policies & documents"): lifecycle, publication as org-wide
// evidence, review-cycle monitoring, and the shared rule for which evidence counts towards coverage.
import { db } from "@/lib/db";
import type { DocumentType, Prisma } from "@/generated/prisma/client";

export const DOC_TYPES: DocumentType[] = ["POLICY", "PROCEDURE", "STANDARD", "ROLES", "OBJECTIVES", "PLAN", "RECORDS", "OTHER"];
/** Controls a document type usually satisfies (pre-selected in the form; the author can change them). */
export const SUGGESTED_CONTROLS: Record<DocumentType, string[]> = {
  POLICY: ["HC-01"], PROCEDURE: ["HC-04"], STANDARD: ["HC-01"], ROLES: ["HC-02"], OBJECTIVES: ["HC-01", "HC-19"],
  PLAN: ["HC-19"], RECORDS: ["HC-12"], OTHER: [],
};
export const REVIEW_CYCLES = [3, 6, 12, 24];
export const REVIEW_NOTICE_DAYS = 30;
const DAY = 24 * 60 * 60 * 1000;

export function addMonths(d: Date, months: number): Date { const x = new Date(d); x.setMonth(x.getMonth() + months); return x; }
export function nextVersion(v: string): string {
  const m = v.match(/^(\d+)\.(\d+)$/);
  return m ? `${m[1]}.${Number(m[2]) + 1}` : `${v}.1`;
}

/** Evidence that counts for a system: its own or organisation-wide, VALID and not past its validity date. */
export function validEvidenceWhere(orgId: string, systemId: string, now: Date = new Date()): Prisma.EvidenceWhereInput {
  return { status: "VALID", AND: [
    { OR: [{ systemId }, { systemId: null, orgId }] },
    { OR: [{ validUntil: null }, { validUntil: { gt: now } }] },
  ] };
}
export function evidenceCountsFor(e: { orgId: string; systemId: string | null; status: string; validUntil: Date | null }, orgId: string, systemId: string, now: Date = new Date()): boolean {
  return e.status === "VALID" && (e.systemId === systemId || (e.systemId === null && e.orgId === orgId)) && (!e.validUntil || e.validUntil > now);
}

type Doc = { id: string; orgId: string; title: string; version: string; content: string | null; controlCodes: string[]; fileName: string | null; mimeType: string | null; sha256: string | null; previousId: string | null; nextReviewDate: Date | null; docType: DocumentType };

/** Publish an approved document as organisation-wide evidence linked to its controls; supersede the previous version. */
export async function publishDocument(doc: Doc, actorId: string | null, approvedAt: Date): Promise<string> {
  const controls = doc.controlCodes.length ? await db.control.findMany({ where: { code: { in: doc.controlCodes } }, select: { id: true } }) : [];
  const ev = await db.evidence.create({ data: {
    orgId: doc.orgId, systemId: null, type: "POLICY_DOCUMENT", source: "UPLOADED", status: "VALID", policyId: doc.id,
    title: `${doc.title} v${doc.version}`, description: doc.content ? doc.content.slice(0, 300) : null,
    content: { documentId: doc.id, docType: doc.docType, version: doc.version } as Prisma.InputJsonValue,
    fileName: doc.fileName, mimeType: doc.mimeType, sha256: doc.sha256, fileUrl: doc.fileName ? `/policies/${doc.id}/file` : null,
    validFrom: approvedAt, validUntil: doc.nextReviewDate, createdById: actorId,
    links: { create: controls.map((c) => ({ controlId: c.id })) },
  } });
  if (doc.previousId) {
    const prev = await db.policy.findUnique({ where: { id: doc.previousId } });
    if (prev && ["ACTIVE", "EXPIRED"].includes(prev.status)) {
      await db.policy.update({ where: { id: prev.id }, data: { status: "SUPERSEDED" } });
      await db.evidence.updateMany({ where: { policyId: prev.id, status: { in: ["VALID", "EXPIRED"] } }, data: { status: "SUPERSEDED" } });
    }
  }
  return ev.id;
}

/**
 * Keep documents and evidence current (idempotent; runs on dashboard / register loads):
 * backfill documents activated before the review workflow, expire documents past their review date and
 * evidence past its validity date, and maintain review tasks (requested reviews, reviews due within 30 days, expired documents).
 */
export async function ensureDocumentLifecycle(orgId: string): Promise<void> {
  const now = new Date();
  // 1) Legacy: ACTIVE documents without approval data
  const legacy = await db.policy.findMany({ where: { orgId, status: "ACTIVE", approvedAt: null } });
  for (const p of legacy) {
    const approvedAt = p.effectiveDate ?? p.createdAt;
    const nextReviewDate = addMonths(approvedAt, p.reviewCycleMonths);
    const controlCodes = p.controlCodes.length ? p.controlCodes : ["HC-01"];
    const old = await db.evidence.findFirst({ where: { orgId, policyId: null, type: "POLICY_DOCUMENT", title: `${p.title} v${p.version} (activated)` } });
    await db.policy.update({ where: { id: p.id }, data: { approvedAt, approvedById: p.ownerId, nextReviewDate, lastReviewedAt: approvedAt, controlCodes, reviewComment: p.reviewComment ?? "Activated before the document review workflow was introduced." } });
    if (old) {
      await db.evidence.update({ where: { id: old.id }, data: { policyId: p.id, validUntil: nextReviewDate } });
      await db.policy.update({ where: { id: p.id }, data: { evidenceId: old.id } });
    } else {
      const evId = await publishDocument({ ...p, controlCodes, nextReviewDate }, p.ownerId, approvedAt);
      await db.policy.update({ where: { id: p.id }, data: { evidenceId: evId } });
    }
  }
  // 2) Expire documents past their review date, and their evidence
  const due = await db.policy.findMany({ where: { orgId, status: "ACTIVE", nextReviewDate: { lt: now } }, select: { id: true } });
  if (due.length) {
    await db.policy.updateMany({ where: { id: { in: due.map((d) => d.id) } }, data: { status: "EXPIRED" } });
    await db.evidence.updateMany({ where: { policyId: { in: due.map((d) => d.id) }, status: "VALID" }, data: { status: "EXPIRED" } });
  }
  // 3) Expire any evidence past its validity date
  await db.evidence.updateMany({ where: { orgId, status: "VALID", validUntil: { lt: now } }, data: { status: "EXPIRED" } });
  // 4) Review tasks
  const docs = await db.policy.findMany({ where: { orgId, status: { in: ["IN_REVIEW", "ACTIVE", "EXPIRED"] } }, select: { id: true, title: true, version: true, status: true, ownerId: true, nextReviewDate: true } });
  const open = await db.task.findMany({ where: { orgId, relatedType: "document", status: { in: ["OPEN", "IN_PROGRESS"] } }, select: { id: true, relatedId: true, title: true } });
  const wanted = new Map<string, { title: string; assigneeId: string | null; dueDate: Date | null }>();
  for (const d of docs) {
    if (d.status === "IN_REVIEW") wanted.set(d.id, { title: `Document review requested: ${d.title} v${d.version}`, assigneeId: null, dueDate: null });
    else if (d.status === "EXPIRED") wanted.set(d.id, { title: `Document expired: ${d.title} v${d.version}`, assigneeId: d.ownerId, dueDate: d.nextReviewDate });
    else if (d.nextReviewDate && d.nextReviewDate.getTime() - now.getTime() <= REVIEW_NOTICE_DAYS * DAY) wanted.set(d.id, { title: `Document review due: ${d.title} v${d.version}`, assigneeId: d.ownerId, dueDate: d.nextReviewDate });
  }
  for (const t of open) {
    const w = t.relatedId ? wanted.get(t.relatedId) : undefined;
    if (!w || w.title !== t.title) await db.task.update({ where: { id: t.id }, data: { status: "DONE" } });
  }
  for (const [docId, w] of wanted) {
    if (open.some((t) => t.relatedId === docId && t.title === w.title)) continue;
    await db.task.create({ data: { orgId, title: w.title, assigneeId: w.assigneeId ?? undefined, dueDate: w.dueDate, status: "OPEN", relatedType: "document", relatedId: docId } });
  }
}

export type DocumentStats = { active: number; inReview: number; dueSoon: number; expired: number; drafts: number; evidenceExpiringSoon: number; evidenceExpired: number };
export async function documentStats(orgId: string): Promise<DocumentStats> {
  const now = new Date(), soon = new Date(now.getTime() + REVIEW_NOTICE_DAYS * DAY);
  const [active, inReview, dueSoon, expired, drafts, evidenceExpiringSoon, evidenceExpired] = await Promise.all([
    db.policy.count({ where: { orgId, status: "ACTIVE" } }),
    db.policy.count({ where: { orgId, status: "IN_REVIEW" } }),
    db.policy.count({ where: { orgId, status: "ACTIVE", nextReviewDate: { gte: now, lte: soon } } }),
    db.policy.count({ where: { orgId, status: "EXPIRED" } }),
    db.policy.count({ where: { orgId, status: "DRAFT" } }),
    db.evidence.count({ where: { orgId, status: "VALID", policyId: null, validUntil: { gte: now, lte: soon } } }),
    db.evidence.count({ where: { orgId, status: "EXPIRED" } }),
  ]);
  return { active, inReview, dueSoon, expired, drafts, evidenceExpiringSoon, evidenceExpired };
}

/** Documents needing action (expired, awaiting review, review due soon) and evidence expiring soon — for the dashboard. */
export async function documentsNeedingAttention(orgId: string, take = 6) {
  const soon = new Date(Date.now() + REVIEW_NOTICE_DAYS * DAY);
  const [documents, evidence] = await Promise.all([
    db.policy.findMany({ where: { orgId, OR: [{ status: { in: ["EXPIRED", "IN_REVIEW"] } }, { status: "ACTIVE", nextReviewDate: { lte: soon } }] }, orderBy: [{ nextReviewDate: "asc" }], take }),
    db.evidence.findMany({ where: { orgId, status: "VALID", policyId: null, validUntil: { lte: soon } }, orderBy: { validUntil: "asc" }, take: 3, include: { system: true } }),
  ]);
  return { documents, evidence };
}

export function isReviewDueSoon(d: { status: string; nextReviewDate: Date | null }, now: Date = new Date()): boolean {
  return d.status === "ACTIVE" && !!d.nextReviewDate && d.nextReviewDate.getTime() - now.getTime() <= REVIEW_NOTICE_DAYS * DAY;
}
/** Document-specific status wording (e.g. ACTIVE reads "In force"); other statuses use the shared enum labels. */
export function docStatusLabel(status: string, t: (k: string) => string, L: (v: string) => string): string {
  return status === "ACTIVE" ? t("In force") : status === "IN_REVIEW" ? t("Awaiting review") : status === "EXPIRED" ? t("Expired") : L(status);
}

export function daysUntil(d: Date, now: Date = new Date()): number { return Math.ceil((d.getTime() - now.getTime()) / DAY); }
