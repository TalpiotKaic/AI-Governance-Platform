import type { Role } from "@/generated/prisma/client";

/**
 * Capability-based access control.
 * Roles are NOT a linear hierarchy: a Reviewer/Approver must not be able to run the tests they review (segregation of duties).
 */
export const PERMISSIONS = [
  "systems.write",      // register / edit AI systems, record change events, set control status
  "systems.delete",
  "risks.write",        // add risks, update risk status
  "plans.write",        // create / complete evaluation plans
  "evaluations.run",    // start / re-run evaluation runs
  "evaluations.annotate", // add human annotations, update finding status
  "evidence.write",     // upload / attest evidence, link to controls, set status
  "reports.generate",   // generate reports & evidence packs
  "reports.review",     // mark reviewed / return to draft
  "reports.approve",    // approve & issue
  "approvals.decide",   // decide deployment / acceptance approvals
  "tasks.write",
  "incidents.write",
  "policies.write",
  "settings.view",
  "settings.manage",    // users, roles, credentials, organisation
  "audit.view",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const ROLES: Role[] = ["ADMIN", "GOVERNANCE_OWNER", "APPROVER", "REVIEWER", "TESTER", "VIEWER"];

const ALL = [...PERMISSIONS] as Permission[];
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: ALL,
  GOVERNANCE_OWNER: ["systems.write", "systems.delete", "risks.write", "plans.write", "evaluations.run", "evidence.write", "reports.generate", "approvals.decide", "tasks.write", "incidents.write", "policies.write", "settings.view", "audit.view"],
  APPROVER: ["reports.approve", "reports.review", "approvals.decide", "tasks.write", "incidents.write", "audit.view"],
  REVIEWER: ["evaluations.annotate", "reports.review", "approvals.decide", "tasks.write", "incidents.write", "audit.view"],
  TESTER: ["systems.write", "risks.write", "plans.write", "evaluations.run", "evaluations.annotate", "evidence.write", "reports.generate", "tasks.write", "incidents.write"],
  VIEWER: [],
};

export function can(role: Role, perm: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(perm);
}

/** Navigation visibility: href → permission needed (missing = visible to everyone). */
export const NAV_PERMISSION: Record<string, Permission | undefined> = {
  "/plans": undefined,
  "/library": undefined,
  "/approvals": "tasks.write",
  "/settings": "settings.view",
};
export function canSeeNav(role: Role, href: string): boolean {
  const p = NAV_PERMISSION[href];
  return p ? can(role, p) : true;
}

/** Route guards for pages that are pure mutation forms. */
export const ROUTE_PERMISSION: { prefix: string; perm: Permission }[] = [
  { prefix: "/systems/new", perm: "systems.write" },
  { prefix: "/risks/new", perm: "risks.write" },
  { prefix: "/plans/new", perm: "plans.write" },
  { prefix: "/evaluations/new", perm: "evaluations.run" },
  { prefix: "/evidence/new", perm: "evidence.write" },
  { prefix: "/reports/new", perm: "reports.generate" },
  { prefix: "/incidents/new", perm: "incidents.write" },
  { prefix: "/settings", perm: "settings.view" },
];
