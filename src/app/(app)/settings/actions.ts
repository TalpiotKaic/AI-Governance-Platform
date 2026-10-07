"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { hashPassword, requirePermission } from "@/lib/auth";
import { encryptSecret } from "@/lib/crypto";
import type { Prisma, Role } from "@/generated/prisma/client";

export async function updateOrgAction(formData: FormData) {
  const user = await requirePermission("settings.manage");
  await db.organization.update({ where: { id: user.orgId }, data: { name: String(formData.get("name")), country: String(formData.get("country") || "") || null, sector: String(formData.get("sector") || "") || null, trustCenterEnabled: formData.get("trustCenterEnabled") === "on", trustCenterIntro: String(formData.get("trustCenterIntro") || "") || null } });
  revalidatePath("/settings");
}

import { redirect } from "next/navigation";

export async function createUserAction(formData: FormData) {
  const user = await requirePermission("settings.manage");
  const email = String(formData.get("email")).toLowerCase().trim();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/settings?error=email_exists");
  }
  await db.user.create({ data: { orgId: user.orgId, email, name: String(formData.get("name")), role: String(formData.get("role")) as Role, title: String(formData.get("title") || "") || null, passwordHash: await hashPassword(String(formData.get("password") || "changeme123")) } });
  redirect("/settings");
}

export async function setUserRoleAction(id: string, formData: FormData) {
  const user = await requirePermission("settings.manage");
  await db.user.findFirstOrThrow({ where: { id, orgId: user.orgId } });
  await db.user.update({ where: { id }, data: { role: String(formData.get("role")) as Role } });
  redirect("/settings");
}

export async function updateUserAction(id: string, formData: FormData) {
  const user = await requirePermission("settings.manage");
  await db.user.findFirstOrThrow({ where: { id, orgId: user.orgId } });
  const email = String(formData.get("email")).toLowerCase().trim();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing && existing.id !== id) {
    redirect("/settings?error=email_exists");
  }

  const password = String(formData.get("password") || "");
  const updateData: Prisma.UserUpdateInput = {
    email,
    name: String(formData.get("name")),
    role: String(formData.get("role")) as Role,
    title: String(formData.get("title") || "") || null,
  };
  if (password.length >= 6) updateData.passwordHash = await hashPassword(password);

  await db.user.update({ where: { id }, data: updateData });
  redirect("/settings");
}

export async function addCredentialAction(formData: FormData) {
  const user = await requirePermission("settings.manage");
  const key = String(formData.get("apiKey") || "");
  if (!key) return;
  await db.providerCredential.create({ data: { orgId: user.orgId, provider: String(formData.get("provider")), label: String(formData.get("label") || formData.get("provider")), encryptedKey: encryptSecret(key), baseUrl: String(formData.get("baseUrl") || "") || null, defaultModel: String(formData.get("defaultModel") || "") || null } });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "credential.added", entityType: "ProviderCredential", summary: String(formData.get("provider")) } });
  revalidatePath("/settings");
}

export async function deleteCredentialAction(id: string) {
  const user = await requirePermission("settings.manage");
  await db.providerCredential.deleteMany({ where: { id, orgId: user.orgId } });
  revalidatePath("/settings");
}
