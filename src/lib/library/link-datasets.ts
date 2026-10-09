import { db } from "@/lib/db";

/**
 * Imported scenarios carry the evaluation dataset they came from. When such scenarios are planned or run
 * against an AI system, register that dataset on the system (purpose "evaluation") so the dataset register
 * and the AI Passport show which evaluation data the system was tested with.
 */
export async function linkScenarioDatasets(systemId: string, scenarioIds: string[]) {
  if (!scenarioIds.length) return 0;
  const rows = await db.testScenario.findMany({ where: { id: { in: scenarioIds }, datasetId: { not: null } }, select: { datasetId: true } });
  const ids = Array.from(new Set(rows.map((r) => r.datasetId!)));
  let linked = 0;
  for (const datasetId of ids) {
    const exists = await db.systemDataset.findUnique({ where: { systemId_datasetId: { systemId, datasetId } } });
    if (exists) continue;
    await db.systemDataset.create({ data: { systemId, datasetId, purpose: "evaluation" } });
    linked++;
  }
  return linked;
}

/** Scenario visibility: the global library plus the organisation's own imported scenarios. */
export function scenarioScope(orgId: string) {
  return { OR: [{ orgId: null }, { orgId }] };
}
