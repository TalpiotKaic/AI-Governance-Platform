import { db } from "@/lib/db";

export type StepState = "done" | "todo" | "skipped";
export type ProgressStep = { key: "register" | "links" | "risks" | "evaluation" | "controls" | "approval"; state: StepState; detail?: string; vars?: Record<string, string | number>; href: string };

/** Internal general-purpose SaaS use (no customer-facing output, no automated decisions, not high-risk): technical testing optional. */
export function isInternalSaas(s: { type: string; customerFacing: boolean; automatedDecision: boolean; euAiActCategory: string }) {
  return s.type === "EXTERNAL_SAAS" && !s.customerFacing && !s.automatedDecision && s.euAiActCategory !== "HIGH_RISK" && s.euAiActCategory !== "GPAI_SYSTEMIC";
}

/** Where a system stands on the path register → links → risks → evaluation → controls → approval, and what to do next. */
export async function systemProgress(systemId: string): Promise<{ steps: ProgressStep[]; next: ProgressStep | null; percent: number }> {
  const s = await db.aiSystem.findUniqueOrThrow({ where: { id: systemId }, include: {
    vendors: { select: { vendorId: true } }, datasets: { select: { datasetId: true } }, risks: { select: { status: true } },
    runs: { where: { status: "COMPLETED" }, orderBy: { finishedAt: "desc" }, take: 1, select: { finishedAt: true, createdAt: true } },
    changeEvents: { where: { requiresRetest: true }, select: { createdAt: true } }, controlImpls: { select: { status: true } },
  } });
  const approvals = await db.approval.findMany({ where: { orgId: s.orgId, subjectType: "SYSTEM_DEPLOYMENT", subjectId: s.id }, select: { decision: true } });
  const base = `/systems/${s.id}`;
  const lastRun = s.runs[0] ? (s.runs[0].finishedAt ?? s.runs[0].createdAt) : null;
  const retest = !!lastRun && s.changeEvents.some((c) => c.createdAt > lastRun);
  const unassessed = s.risks.filter((r) => r.status === "IDENTIFIED").length;
  const applicable = s.controlImpls.filter((i) => i.status !== "NOT_APPLICABLE");
  const met = applicable.filter((i) => i.status === "IMPLEMENTED" || i.status === "VERIFIED").length;
  const ratio = applicable.length ? met / applicable.length : 0;
  const pendingApprovals = approvals.filter((a) => a.decision === "PENDING").length;
  const steps: ProgressStep[] = [
    { key: "register", state: "done", href: `${base}/edit` },
    { key: "links", state: s.vendors.length || s.datasets.length ? "done" : "todo", vars: { v: s.vendors.length, d: s.datasets.length }, href: `${base}?tab=overview` },
    { key: "risks", state: s.risks.length && !unassessed ? "done" : "todo", vars: { n: unassessed }, href: `${base}?tab=risks` },
    { key: "evaluation", state: isInternalSaas(s) && !lastRun ? "skipped" : lastRun && !retest ? "done" : "todo", detail: retest ? "retest" : undefined, href: `${base}?tab=evaluations` },
    { key: "controls", state: ratio >= 0.8 ? "done" : "todo", vars: { p: Math.round(ratio * 100) }, href: `${base}?tab=controls` },
    { key: "approval", state: approvals.length && !pendingApprovals && approvals.every((a) => a.decision === "APPROVED") ? "done" : "todo", vars: { n: pendingApprovals }, href: `${base}?tab=changes` },
  ];
  const counted = steps.filter((x) => x.state !== "skipped");
  return { steps, next: steps.find((x) => x.state === "todo") ?? null, percent: Math.round((counted.filter((x) => x.state === "done").length / counted.length) * 100) };
}
