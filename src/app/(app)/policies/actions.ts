"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { copyFile, mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { requirePermission, type SessionUser } from "@/lib/auth";
import { sha256 } from "@/lib/crypto";
import { DOC_TYPES, REVIEW_CYCLES, addMonths, nextVersion, publishDocument } from "@/lib/documents";
import type { DocumentType } from "@/generated/prisma/client";
import { syncControlStatuses } from "@/lib/controls/status";
import { BASELINE, BASELINE_KEYS, baselineTemplate } from "@/lib/baseline-documents";
import { getLocale } from "@/lib/i18n/server";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = /\.(md|markdown|txt|pdf|docx?|hwpx?|xlsx|pptx|odt)$/i;
const s = (fd: FormData, k: string) => { const v = fd.get(k); return typeof v === "string" ? v.trim() : ""; };
const dir = (orgId: string) => path.join(process.cwd(), "uploads", orgId);
const prefix = (docId: string) => `doc_${docId}__`;

async function removeFile(orgId: string, docId: string) {
  const files = await readdir(dir(orgId)).catch(() => [] as string[]);
  for (const f of files.filter((f) => f.startsWith(prefix(docId)))) await unlink(path.join(dir(orgId), f)).catch(() => undefined);
}
async function refreshControls(orgId: string) { await syncControlStatuses(orgId); }
function revalidateAll(id?: string) {
  revalidatePath("/policies"); revalidatePath("/dashboard"); revalidatePath("/evidence"); revalidatePath("/approvals"); revalidatePath("/frameworks");
  if (id) revalidatePath(`/policies/${id}`);
}
async function audit(user: SessionUser, action: string, id: string, summary: string) {
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action, entityType: "Policy", entityId: id, summary } });
}
async function load(user: SessionUser, id: string) { return db.policy.findFirstOrThrow({ where: { id, orgId: user.orgId } }); }

/** Create (id = null) or update a draft document: body text and/or a file, linked controls, review cycle. */
export async function saveDocumentAction(id: string | null, formData: FormData) {
  const user = await requirePermission("policies.write");
  const existing = id ? await load(user, id) : null;
  if (existing && existing.status !== "DRAFT") redirect(`/policies/${id}?error=not_draft`);
  const title = s(formData, "title");
  if (!title) redirect(id ? `/policies/${id}?edit=1&error=title` : "/policies/new?error=title");
  const docType = (DOC_TYPES as string[]).includes(s(formData, "docType")) ? (s(formData, "docType") as DocumentType) : "POLICY";
  const cycle = Number(s(formData, "reviewCycleMonths"));
  const known = new Set((await db.control.findMany({ select: { code: true } })).map((c) => c.code));
  const data = {
    title, docType, version: s(formData, "version") || "1.0", content: s(formData, "content") || null,
    reviewCycleMonths: REVIEW_CYCLES.includes(cycle) ? cycle : 12,
    controlCodes: formData.getAll("controlCodes").map(String).filter((c) => known.has(c)),
  };
  const doc = existing ? await db.policy.update({ where: { id: existing.id }, data }) : await db.policy.create({ data: { ...data, orgId: user.orgId, status: "DRAFT", ownerId: user.id } });
  const file = formData.get("file");
  if (file && typeof file === "object" && "arrayBuffer" in file && file.size > 0) {
    if (file.size > MAX_BYTES || !ALLOWED.test(file.name)) redirect(`/policies/${doc.id}?edit=1&error=file`);
    const buf = Buffer.from(await file.arrayBuffer());
    await mkdir(dir(user.orgId), { recursive: true });
    await removeFile(user.orgId, doc.id);
    await writeFile(path.join(dir(user.orgId), `${prefix(doc.id)}${file.name.replace(/[^\w.\-]+/g, "_")}`), buf);
    await db.policy.update({ where: { id: doc.id }, data: { fileName: file.name, mimeType: file.type || "application/octet-stream", sha256: sha256(buf) } });
  } else if (s(formData, "removeFile") === "1") {
    await removeFile(user.orgId, doc.id);
    await db.policy.update({ where: { id: doc.id }, data: { fileName: null, mimeType: null, sha256: null } });
  }
  await audit(user, existing ? "document.updated" : "document.created", doc.id, `${doc.title} v${doc.version}`);
  await refreshControls(user.orgId);
  revalidateAll(doc.id);
  redirect(`/policies/${doc.id}`);
}

export async function submitDocumentAction(id: string) {
  const user = await requirePermission("policies.write");
  const d = await load(user, id);
  if (d.status !== "DRAFT") redirect(`/policies/${id}?error=not_draft`);
  if (!d.content && !d.fileName) redirect(`/policies/${id}?error=empty`);
  await db.policy.update({ where: { id }, data: { status: "IN_REVIEW", submittedById: user.id, submittedAt: new Date(), reviewComment: null } });
  await audit(user, "document.submitted", id, `${d.title} v${d.version} submitted for review`);
  await refreshControls(user.orgId);
  revalidateAll(id);
  redirect(`/policies/${id}`);
}

/** Segregation of duties: the author / submitter may not review their own document, except an administrator (flagged). */
function reviewGate(user: SessionUser, d: { ownerId: string | null; submittedById: string | null }, id: string) {
  const own = user.id === d.ownerId || user.id === d.submittedById;
  if (own && user.role !== "ADMIN") redirect(`/policies/${id}?error=own`);
  return own;
}

export async function approveDocumentAction(id: string, formData: FormData) {
  const user = await requirePermission("policies.review");
  const d = await load(user, id);
  if (d.status !== "IN_REVIEW") redirect(`/policies/${id}?error=not_in_review`);
  const self = reviewGate(user, d, id);
  const now = new Date(), next = addMonths(now, d.reviewCycleMonths);
  const updated = await db.policy.update({ where: { id }, data: { status: "ACTIVE", approvedById: user.id, approvedAt: now, effectiveDate: now, lastReviewedAt: now, nextReviewDate: next, selfApproved: self, reviewComment: s(formData, "comment") || null } });
  const evidenceId = await publishDocument(updated, user.id, now);
  await db.policy.update({ where: { id }, data: { evidenceId } });
  await audit(user, "document.approved", id, `${d.title} v${d.version} approved${self ? " (self-review)" : ""}; next review ${next.toISOString().slice(0, 10)}`);
  await refreshControls(user.orgId);
  revalidateAll(id);
  redirect(`/policies/${id}`);
}

export async function returnDocumentAction(id: string, formData: FormData) {
  const user = await requirePermission("policies.review");
  const d = await load(user, id);
  if (d.status !== "IN_REVIEW") redirect(`/policies/${id}?error=not_in_review`);
  await db.policy.update({ where: { id }, data: { status: "DRAFT", reviewComment: s(formData, "comment") || null } });
  await audit(user, "document.returned", id, `${d.title} v${d.version} returned to draft`);
  await refreshControls(user.orgId);
  revalidateAll(id);
  redirect(`/policies/${id}`);
}

/** Periodic review with no change to the content: extends the validity by one review cycle. */
export async function confirmReviewAction(id: string, formData: FormData) {
  const user = await requirePermission("policies.review");
  const d = await load(user, id);
  if (d.status !== "ACTIVE" && d.status !== "EXPIRED") redirect(`/policies/${id}?error=not_active`);
  const self = reviewGate(user, { ownerId: d.ownerId, submittedById: null }, id);
  const now = new Date(), next = addMonths(now, d.reviewCycleMonths);
  await db.policy.update({ where: { id }, data: { status: "ACTIVE", lastReviewedAt: now, nextReviewDate: next, approvedById: user.id, selfApproved: self, reviewComment: s(formData, "comment") || null } });
  if (d.evidenceId) await db.evidence.update({ where: { id: d.evidenceId }, data: { status: "VALID", validUntil: next } });
  await audit(user, "document.reviewed", id, `${d.title} v${d.version} periodic review — no change${self ? " (self-review)" : ""}; next review ${next.toISOString().slice(0, 10)}`);
  await refreshControls(user.orgId);
  revalidateAll(id);
  redirect(`/policies/${id}`);
}

/** Start a new version from an active or expired document (the current version stays in force until the new one is approved). */
export async function reviseDocumentAction(id: string) {
  const user = await requirePermission("policies.write");
  const d = await load(user, id);
  const pending = await db.policy.findFirst({ where: { orgId: user.orgId, previousId: id, status: { in: ["DRAFT", "IN_REVIEW"] } } });
  if (pending) redirect(`/policies/${pending.id}`);
  if (d.status !== "ACTIVE" && d.status !== "EXPIRED") redirect(`/policies/${id}?error=not_active`);
  const r = await db.policy.create({ data: { orgId: user.orgId, title: d.title, docType: d.docType, version: nextVersion(d.version), content: d.content, controlCodes: d.controlCodes, reviewCycleMonths: d.reviewCycleMonths, status: "DRAFT", ownerId: user.id, previousId: d.id, fileName: d.fileName, mimeType: d.mimeType, sha256: d.sha256 } });
  if (d.fileName) {
    const files = await readdir(dir(user.orgId)).catch(() => [] as string[]);
    const f = files.find((x) => x.startsWith(prefix(d.id)));
    if (f) await copyFile(path.join(dir(user.orgId), f), path.join(dir(user.orgId), `${prefix(r.id)}${f.slice(prefix(d.id).length)}`));
  }
  await audit(user, "document.revised", r.id, `${d.title} v${r.version} drafted from v${d.version}`);
  await refreshControls(user.orgId);
  revalidateAll(r.id);
  redirect(`/policies/${r.id}?edit=1`);
}

export async function retireDocumentAction(id: string) {
  const user = await requirePermission("policies.write");
  const d = await load(user, id);
  if (d.status !== "ACTIVE" && d.status !== "EXPIRED") redirect(`/policies/${id}?error=not_active`);
  await db.policy.update({ where: { id }, data: { status: "RETIRED" } });
  await db.evidence.updateMany({ where: { policyId: id, status: { in: ["VALID", "EXPIRED"] } }, data: { status: "SUPERSEDED" } });
  await audit(user, "document.retired", id, `${d.title} v${d.version} retired`);
  await refreshControls(user.orgId);
  revalidateAll(id);
  redirect(`/policies/${id}`);
}

export async function deleteDocumentAction(id: string) {
  const user = await requirePermission("policies.write");
  const d = await load(user, id);
  if (d.status !== "DRAFT") redirect(`/policies/${id}?error=not_draft`);
  await removeFile(user.orgId, id);
  await db.policy.delete({ where: { id } });
  await audit(user, "document.deleted", id, `${d.title} v${d.version} draft deleted`);
  await refreshControls(user.orgId);
  revalidateAll();
  redirect(d.previousId ? `/policies/${d.previousId}` : "/policies");
}

/** Create the missing documents of the baseline set as drafts, in the user's language, filled with the organisation and its AI inventory. */
export async function createBaselineDocumentsAction() {
  const user = await requirePermission("policies.write");
  const locale = await getLocale();
  const [org, systems, existing] = await Promise.all([
    db.organization.findUniqueOrThrow({ where: { id: user.orgId }, select: { name: true } }),
    db.aiSystem.findMany({ where: { orgId: user.orgId }, orderBy: { code: "asc" }, select: { code: true, name: true, purpose: true } }),
    db.policy.findMany({ where: { orgId: user.orgId, templateKey: { not: null }, status: { notIn: ["RETIRED"] } }, select: { templateKey: true } }),
  ]);
  const have = new Set(existing.map((d) => d.templateKey));
  const list = systems.map((s) => `- ${s.code} ${s.name}${s.purpose ? ` — ${s.purpose}` : ""}`).join("\n") || "- —";
  let created = 0;
  for (const key of BASELINE_KEYS.filter((k) => !have.has(k))) {
    const tpl = baselineTemplate(locale, key), meta = BASELINE[key];
    const doc = await db.policy.create({ data: { orgId: user.orgId, templateKey: key, title: tpl.title, content: tpl.body(org.name, list), docType: meta.docType, controlCodes: meta.controlCodes, reviewCycleMonths: meta.reviewCycleMonths, status: "DRAFT", ownerId: user.id } });
    await audit(user, "document.created", doc.id, `${doc.title} v${doc.version} (baseline)`);
    created++;
  }
  await refreshControls(user.orgId);
  revalidateAll();
  redirect(`/policies?f=draft&created=${created}`);
}
