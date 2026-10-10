// Automatic control status per AI system. Users only record exceptions (with a reason).
//   NOT_APPLICABLE  — derived from the intake (e.g. agent controls for non-agents)
//   VERIFIED        — latest tests for the control passed            (testStatus written by the runner)
//   IN_PROGRESS     — latest tests failed / re-test required, or a linked document is in draft or review
//   IMPLEMENTED     — valid evidence (system or organisation-wide) is linked to the control, or the platform record itself
//                     is the evidence (HC-03: the system is in the inventory; HC-04: every risk has been assessed)
//   NOT_STARTED     — nothing yet
import { db } from "@/lib/db";
import type { ControlStatus } from "@/generated/prisma/client";
import { validEvidenceWhere } from "@/lib/documents";

type SystemFacts = { id: string; type: string; euAiActCategory: string; usesPersonalData: boolean; usesSensitiveData: boolean; customerFacing: boolean; automatedDecision: boolean };

/** Intake-based applicability: returns a reason code when the control does not apply to the system. */
export function notApplicableReason(code: string, s: SystemFacts): string | null {
  const agent = s.type === "AGENT" || s.type === "MULTI_AGENT";
  const highRisk = s.euAiActCategory === "HIGH_RISK" || s.euAiActCategory === "GPAI_SYSTEMIC";
  const internalSaas = s.type === "EXTERNAL_SAAS" && !s.automatedDecision && !s.customerFacing && !highRisk;
  if (code === "HC-23" && !agent) return "na_not_agent";
  if (code === "HC-25" && !highRisk) return "na_not_high_risk";
  if (code === "HC-26" && !s.usesPersonalData && !s.usesSensitiveData) return "na_no_personal_data";
  if (code === "HC-24" && s.type === "PREDICTIVE_ML" && !s.customerFacing) return "na_not_user_facing";
  if (["HC-07", "HC-08", "HC-21", "HC-22"].includes(code) && internalSaas) return "na_internal_saas";
  return null;
}

/** Recompute automatic statuses for the given systems (all systems of the org when omitted). Manual exceptions are kept. */
export async function syncControlStatuses(orgId: string, systemIds?: string[]): Promise<void> {
  const systems = await db.aiSystem.findMany({ where: { orgId, ...(systemIds ? { id: { in: systemIds } } : {}) }, select: { id: true, type: true, euAiActCategory: true, usesPersonalData: true, usesSensitiveData: true, customerFacing: true, automatedDecision: true } });
  if (!systems.length) return;
  const controls = await db.control.findMany({ select: { id: true, code: true } });
  const pending = new Set((await db.policy.findMany({ where: { orgId, status: { in: ["DRAFT", "IN_REVIEW"] } }, select: { controlCodes: true } })).flatMap((p) => p.controlCodes));
  for (const s of systems) {
    const [impls, links, risks] = await Promise.all([
      db.controlImplementation.findMany({ where: { systemId: s.id } }),
      db.evidenceLink.findMany({ where: { controlId: { not: null }, evidence: validEvidenceWhere(orgId, s.id) }, select: { controlId: true } }),
      db.risk.findMany({ where: { systemId: s.id }, select: { status: true } }),
    ]);
    const unassessed = risks.filter((r) => r.status === "IDENTIFIED").length;
    const implBy = new Map(impls.map((i) => [i.controlId, i]));
    const evBy = new Map<string, number>();
    for (const l of links) evBy.set(l.controlId!, (evBy.get(l.controlId!) ?? 0) + 1);
    for (const c of controls) {
      const impl = implBy.get(c.id);
      if (impl && !impl.auto) continue; // manual exception
      const na = notApplicableReason(c.code, s);
      const ev = evBy.get(c.id) ?? 0;
      let status: ControlStatus, reason: string;
      if (na) { status = "NOT_APPLICABLE"; reason = na; }
      else if (impl?.testStatus === "VERIFIED") { status = "VERIFIED"; reason = "test_pass"; }
      else if (impl?.testStatus === "IN_PROGRESS") { status = "IN_PROGRESS"; reason = impl.notes?.startsWith("Re-test required") ? "retest" : "test_fail"; }
      else if (ev > 0) { status = "IMPLEMENTED"; reason = `evidence:${ev}`; }
      else if (c.code === "HC-03") { status = "IMPLEMENTED"; reason = "platform_inventory"; }
      else if (c.code === "HC-04" && risks.length && !unassessed) { status = "IMPLEMENTED"; reason = "platform_risks"; }
      else if (c.code === "HC-04" && unassessed) { status = "IN_PROGRESS"; reason = `risks_pending:${unassessed}`; }
      else if (pending.has(c.code)) { status = "IN_PROGRESS"; reason = "doc_pending"; }
      else { status = "NOT_STARTED"; reason = "none"; }
      if (impl && impl.status === status && impl.autoReason === reason) continue;
      if (impl) await db.controlImplementation.update({ where: { id: impl.id }, data: { status, autoReason: reason } });
      else await db.controlImplementation.create({ data: { systemId: s.id, controlId: c.id, status, autoReason: reason, auto: true } });
    }
  }
}

/** Human-readable explanation key for an automatic status reason (translated with t()). */
export function autoReasonText(reason: string | null | undefined, t: (k: string) => string): string {
  if (!reason) return "";
  if (reason.startsWith("evidence:")) return t("{n} valid evidence item(s) linked").replace("{n}", reason.split(":")[1]);
  if (reason.startsWith("risks_pending:")) return t("{n} risk(s) still to assess in the risk register").replace("{n}", reason.split(":")[1]);
  const map: Record<string, string> = {
    test_pass: "Tests for this control passed", test_fail: "Latest test did not pass every metric", retest: "Re-test required after a recorded change",
    doc_pending: "A linked document is in draft or review", none: "No evidence or test yet",
    platform_inventory: "Registered and classified in the AI inventory", platform_risks: "All risks in the register have been assessed",
    na_not_agent: "Not an agent system", na_not_high_risk: "Not high-risk under the EU AI Act", na_no_personal_data: "No personal or sensitive data",
    na_not_user_facing: "Predictive model without user-facing output", na_internal_saas: "General-purpose SaaS tool used internally",
  };
  return t(map[reason] ?? reason);
}
