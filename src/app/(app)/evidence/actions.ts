"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { sha256 } from "@/lib/crypto";
import type { EvidenceType } from "@/generated/prisma/client";

export async function createEvidenceAction(formData: FormData) {
  const user = await requireRole("TESTER");
  const systemId = String(formData.get("systemId") || "") || null;
  if (systemId) await db.aiSystem.findFirstOrThrow({ where: { id: systemId, orgId: user.orgId } });
  const controlIds = formData.getAll("controlIds").map(String).filter(Boolean);
  const file = formData.get("file");
  let fileName: string | undefined, fileUrl: string | undefined, mimeType: string | undefined, hash: string | undefined;
  const source = String(formData.get("source") || "UPLOADED") as "UPLOADED" | "ATTESTATION";
  const ev = await db.evidence.create({ data: {
    orgId: user.orgId, systemId, type: String(formData.get("type")) as EvidenceType, source, title: String(formData.get("title")), description: String(formData.get("description") ?? "") || null,
    validUntil: formData.get("validUntil") ? new Date(String(formData.get("validUntil"))) : null, createdById: user.id,
    links: { create: controlIds.map((controlId) => ({ controlId })) },
  } });
  if (file && typeof file === "object" && "arrayBuffer" in file && file.size > 0) {
    const buf = Buffer.from(await file.arrayBuffer());
    const dir = path.join(process.cwd(), "uploads", user.orgId);
    await mkdir(dir, { recursive: true });
    const safe = file.name.replace(/[^\w.\-]+/g, "_");
    await writeFile(path.join(dir, `${ev.id}__${safe}`), buf);
    fileName = file.name; fileUrl = `/api/files/${ev.id}`; mimeType = file.type || "application/octet-stream"; hash = sha256(buf);
    await db.evidence.update({ where: { id: ev.id }, data: { fileName, fileUrl, mimeType, sha256: hash } });
  }
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "evidence.created", entityType: "Evidence", entityId: ev.id, summary: ev.title } });
  revalidatePath("/evidence");
  redirect(`/evidence/${ev.id}`);
}

export async function setEvidenceStatusAction(id: string, status: "VALID" | "EXPIRED" | "SUPERSEDED" | "DRAFT") {
  const user = await requireRole("TESTER");
  await db.evidence.findFirstOrThrow({ where: { id, orgId: user.orgId } });
  await db.evidence.update({ where: { id }, data: { status } });
  revalidatePath(`/evidence/${id}`);
}

export async function linkEvidenceAction(id: string, formData: FormData) {
  const user = await requireRole("TESTER");
  await db.evidence.findFirstOrThrow({ where: { id, orgId: user.orgId } });
  const controlId = String(formData.get("controlId") || "") || null;
  const requirementId = String(formData.get("requirementId") || "") || null;
  if (!controlId && !requirementId) return;
  await db.evidenceLink.create({ data: { evidenceId: id, controlId, requirementId } });
  revalidatePath(`/evidence/${id}`);
}
