import { db } from "@/lib/db";
import type { FrameworkCode, ReportType, Prisma } from "@/generated/prisma/client";
import { buildAriaReport, buildEvaluationReport, buildEvidencePack, buildPassport, buildVerificationReport } from "./builders";
import type { ReportContent } from "./types";

const TITLES: Record<ReportType, string> = {
  EVALUATION_REPORT: "AI Evaluation Report",
  VERIFICATION_REPORT: "AI System Verification Report",
  NIST_ARIA_EVALUATION_REPORT: "NIST ARIA Evaluation Report (AI 200-3 worksheets)",
  ISO_42001_EVIDENCE_PACK: "ISO/IEC 42001 Evidence Pack",
  EU_AI_ACT_EVIDENCE_PACK: "EU AI Act Evidence Pack",
  NIST_AI_RMF_EVIDENCE_PACK: "NIST AI RMF Evidence Pack",
  KR_AI_BASIC_ACT_EVIDENCE_PACK: "Korea AI Basic Act Evidence Pack",
  AI_PASSPORT: "AI Passport (living factsheet)",
};

export async function generateReport(opts: { orgId: string; systemId: string; type: ReportType; runIds?: string[]; planId?: string; createdById?: string; signers?: { tester?: string; reviewer?: string; approver?: string } }) {
  let content: ReportContent;
  switch (opts.type) {
    case "EVALUATION_REPORT": {
      const runId = opts.runIds?.[0]; if (!runId) throw new Error("runId required");
      content = await buildEvaluationReport(runId); break;
    }
    case "VERIFICATION_REPORT": {
      if (!opts.runIds?.length) throw new Error("runIds required");
      content = await buildVerificationReport(opts.runIds, opts.signers); break;
    }
    case "NIST_ARIA_EVALUATION_REPORT": {
      if (!opts.planId) throw new Error("planId required");
      content = await buildAriaReport(opts.planId); break;
    }
    case "ISO_42001_EVIDENCE_PACK": content = await buildEvidencePack(opts.systemId, "ISO_42001"); break;
    case "EU_AI_ACT_EVIDENCE_PACK": content = await buildEvidencePack(opts.systemId, "EU_AI_ACT"); break;
    case "NIST_AI_RMF_EVIDENCE_PACK": content = await buildEvidencePack(opts.systemId, "NIST_AI_RMF"); break;
    case "KR_AI_BASIC_ACT_EVIDENCE_PACK": content = await buildEvidencePack(opts.systemId, "KR_AI_BASIC_ACT"); break;
    case "AI_PASSPORT": content = await buildPassport(opts.systemId); break;
  }
  const count = await db.report.count({ where: { orgId: opts.orgId } });
  const prev = await db.report.findFirst({ where: { systemId: opts.systemId, type: opts.type, supersededBy: null }, orderBy: { version: "desc" } });
  const system = await db.aiSystem.findUniqueOrThrow({ where: { id: opts.systemId } });
  const report = await db.report.create({
    data: {
      orgId: opts.orgId, systemId: opts.systemId, type: opts.type, code: `RPT-${String(count + 1).padStart(4, "0")}`,
      title: `${TITLES[opts.type]} — ${system.code} ${system.name}`,
      version: prev ? prev.version + 1 : 1, status: "DRAFT",
      content: content as unknown as Prisma.InputJsonValue, createdById: opts.createdById,
      supersedesId: prev?.id,
      runs: opts.runIds?.length ? { create: opts.runIds.map((runId) => ({ runId })) } : undefined,
    },
  });
  if (prev) await db.report.update({ where: { id: prev.id }, data: { status: "SUPERSEDED" } });
  // Evidence record for the report itself (reports are evidence too)
  const evType = opts.type === "EVALUATION_REPORT" || opts.type === "NIST_ARIA_EVALUATION_REPORT" ? "EVALUATION_METRICS" : opts.type === "VERIFICATION_REPORT" ? "TEST_REPORT" : opts.type === "AI_PASSPORT" ? "MODEL_CARD" : "CONFORMITY_ASSESSMENT";
  await db.evidence.create({ data: { orgId: opts.orgId, systemId: opts.systemId, runId: opts.runIds?.[0], type: evType, source: "GENERATED", title: `${report.code} ${TITLES[opts.type]} v${report.version}`, description: `Generated report ${report.code}`, content: { reportId: report.id } as Prisma.InputJsonValue, createdById: opts.createdById } });
  await db.auditLog.create({ data: { orgId: opts.orgId, actorId: opts.createdById, action: "report.generated", entityType: "Report", entityId: report.id, summary: `${report.code} ${TITLES[opts.type]} v${report.version}` } });
  return report;
}

export const FRAMEWORK_PACK_TYPE: Record<FrameworkCode, ReportType | null> = {
  ISO_42001: "ISO_42001_EVIDENCE_PACK", EU_AI_ACT: "EU_AI_ACT_EVIDENCE_PACK", NIST_AI_RMF: "NIST_AI_RMF_EVIDENCE_PACK", KR_AI_BASIC_ACT: "KR_AI_BASIC_ACT_EVIDENCE_PACK", NIST_ARIA: null,
};
export { TITLES as REPORT_TITLES };
