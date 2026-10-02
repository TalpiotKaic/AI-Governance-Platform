import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cache } from "react";
import { db } from "@/lib/db";
import type { Role } from "@/generated/prisma/client";
import { can, type Permission } from "@/lib/permissions";

const COOKIE = "kveriai_session";
const encoder = new TextEncoder();

function secret() {
  return encoder.encode(process.env.AUTH_SECRET ?? "k-veriai-dev-secret");
}

export type SessionUser = {
  id: string;
  orgId: string;
  email: string;
  name: string;
  role: Role;
  orgName: string;
  orgSlug: string;
  orgType: "VERIFICATION_BODY" | "ENTERPRISE";
};

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export const getSession = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const userId = payload.sub;
    if (!userId) return null;
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { org: true },
    });
    if (!user) return null;
    return {
      id: user.id,
      orgId: user.orgId,
      email: user.email,
      name: user.name,
      role: user.role,
      orgName: user.org.name,
      orgSlug: user.org.slug,
      orgType: user.org.type,
    };
  } catch {
    return null;
  }
});

export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

const ROLE_RANK: Record<Role, number> = {
  VIEWER: 0,
  TESTER: 1,
  REVIEWER: 2,
  APPROVER: 3,
  GOVERNANCE_OWNER: 4,
  ADMIN: 5,
};

export function hasRole(user: SessionUser, minimum: Role) {
  return ROLE_RANK[user.role] >= ROLE_RANK[minimum];
}

/** @deprecated Prefer requirePermission — roles are not a strict hierarchy. Kept for ADMIN-only checks. */
export async function requireRole(minimum: Role): Promise<SessionUser> {
  const user = await requireUser();
  if (!hasRole(user, minimum)) {
    throw new Error(`Forbidden: requires ${minimum}`);
  }
  return user;
}

/** Server-action guard: throws if the user's role lacks the capability. */
export async function requirePermission(perm: Permission): Promise<SessionUser> {
  const user = await requireUser();
  if (!can(user.role, perm)) throw new Error(`Forbidden: requires permission ${perm}`);
  return user;
}

/** Page guard: redirects to /forbidden instead of throwing. */
export async function requirePagePermission(perm: Permission): Promise<SessionUser> {
  const user = await requireUser();
  if (!can(user.role, perm)) redirect(`/forbidden?need=${perm}`);
  return user;
}

export function userCan(user: SessionUser, perm: Permission) {
  return can(user.role, perm);
}

export async function verifyCredentials(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}
