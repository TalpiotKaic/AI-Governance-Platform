import { db } from "@/lib/db";
import { defaultDueDate } from "@/lib/risks/due";
import { nextCode, riskScore } from "@/lib/utils";
import { VENDOR_HIGH_RISK } from "./assessment";

/**
 * High-risk vendor (score ≥ 60) linked to a high-risk system (EU AI Act HIGH_RISK or intake tier HIGH/CRITICAL)
 * → one open risk per (system, vendor) in the register, source VENDOR. Idempotent.
 */
export async function ensureVendorRisks(orgId: string, filter: { systemId?: string; vendorId?: string } = {}) {
  const links = await db.systemVendor.findMany({
    where: { ...(filter.systemId ? { systemId: filter.systemId } : {}), ...(filter.vendorId ? { vendorId: filter.vendorId } : {}), vendor: { orgId, riskScore: { gte: VENDOR_HIGH_RISK } }, system: { orgId, OR: [{ euAiActCategory: "HIGH_RISK" }, { riskTier: { in: ["HIGH", "CRITICAL"] } }] } },
    include: { vendor: true, system: { select: { id: true, code: true, ownerId: true } } },
  });
  const created: string[] = [];
  for (const l of links) {
    const title = `Vendor risk: ${l.vendor.name}`;
    const open = await db.risk.findFirst({ where: { systemId: l.systemId, source: "VENDOR", title, status: { notIn: ["CLOSED", "ACCEPTED"] } } });
    if (open) continue;
    const count = await db.risk.count({ where: { orgId } });
    const severity = (l.vendor.riskScore ?? 0) >= 80 ? 5 : 4;
    const r = await db.risk.create({ data: {
      orgId, systemId: l.systemId, code: nextCode("R", count), title,
      description: `Third-party vendor "${l.vendor.name}" (${l.role ?? l.vendor.serviceType ?? "vendor"}) scored ${l.vendor.riskScore}/100 in due diligence and is linked to a high-risk system. ${l.vendor.dataSensitivity ? `Data exposed: ${l.vendor.dataSensitivity}.` : ""}`.trim(),
      dimension: "EXPOSURE", likelihood: 3, severity, score: riskScore(3, severity), status: "IDENTIFIED", source: "VENDOR", ownerId: l.system.ownerId ?? undefined, dueDate: defaultDueDate(riskScore(3, severity)),
      mitigation: "Complete vendor due diligence gaps (certification, no-training clause, DPA, exit plan); restrict data shared; prepare an alternative vendor; re-assess within 90 days.",
    } });
    created.push(r.code);
  }
  return created;
}
