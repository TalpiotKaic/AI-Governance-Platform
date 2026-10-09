"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import type { Prisma } from "@/generated/prisma/client";
import { buildScenarioDrafts, parseEvalJsonl, type Lang } from "@/lib/library/import-jsonl";
import { ensureTestMethod } from "@/lib/library/ensure-methods";

export type ImportScenariosState = { error?: string };

const MAX_BYTES = 10 * 1024 * 1024;

export async function importScenariosAction(_prev: ImportScenariosState, formData: FormData): Promise<ImportScenariosState> {
  const user = await requirePermission("plans.write");
  const file = formData.get("file");
  if (!file || typeof file !== "object" || !("text" in file) || file.size === 0) return { error: "Choose a .jsonl file first." };
  if (file.size > MAX_BYTES) return { error: "File is too large (max 10 MB)." };
  if (!/\.(jsonl|json|ndjson)$/i.test(file.name)) return { error: "Only .jsonl files are supported." };
  const parsed = parseEvalJsonl(await file.text());
  if (!parsed.records.length) return { error: "No usable records found. Expected one JSON object per line with risk_axis, id and messages / prompt." };
  const langs = formData.getAll("langs").map(String).filter((l): l is Lang => l === "ko" || l === "en").filter((l) => parsed.languages.includes(l));
  if (!langs.length) return { error: "Select at least one language to import." };
  const drafts = buildScenarioDrafts(parsed.records, langs);
  if (!drafts.length) return { error: "No usable records found. Expected one JSON object per line with risk_axis, id and messages / prompt." };
  const datasetName = String(formData.get("datasetName") || "").trim() || file.name.replace(/\.(jsonl|json|ndjson)$/i, "");
  const version = String(formData.get("version") || "").trim() || parsed.asOf || null;
  const source = String(formData.get("source") || "").trim() || null;
  const systemIds = formData.getAll("systemIds").map(String).filter(Boolean);
  const systems = systemIds.length ? await db.aiSystem.findMany({ where: { id: { in: systemIds }, orgId: user.orgId }, select: { id: true } }) : [];

  // Methods referenced by the drafts (TM-15 may be missing on databases seeded before it existed).
  const methodIds = new Map<string, string>();
  for (const code of Array.from(new Set(drafts.map((d) => d.methodCode)))) methodIds.set(code, await ensureTestMethod(code));

  const promptCount = drafts.reduce((n, d) => n + d.prompts.length, 0);
  const dataset = await db.dataset.create({ data: {
    orgId: user.orgId, name: datasetName, version, source,
    description: `Evaluation prompt set imported into the test library (${drafts.length} scenarios, ${promptCount} prompts, languages ${langs.join("/")}). Risk axes: ${Array.from(new Set(drafts.map((d) => d.axis))).sort().join(", ")}.`,
    containsPii: false, sensitivity: "internal", recordCount: parsed.records.length,
  } });

  // Global unique scenario codes: SC-IMP-0001, …
  const last = await db.testScenario.findFirst({ where: { code: { startsWith: "SC-IMP-" } }, orderBy: { code: "desc" }, select: { code: true } });
  let seq = last ? Number(last.code.replace("SC-IMP-", "")) || 0 : 0;
  const created: string[] = [];
  for (const d of drafts) {
    seq++;
    const sc = await db.testScenario.create({ data: {
      orgId: user.orgId, methodId: methodIds.get(d.methodCode)!, code: `SC-IMP-${String(seq).padStart(4, "0")}`, name: d.name, sector: d.sector, useCase: d.useCase, targetConcept: d.targetConcept,
      description: d.description, instructions: d.instructions, tactic: d.tactic, prompts: d.prompts as unknown as Prisma.InputJsonValue, annotationSchema: d.annotationSchema as unknown as Prisma.InputJsonValue,
      questionnaire: [], defaultSeverity: d.defaultSeverity, applicableTo: ["LLM_APPLICATION", "RAG_ASSISTANT", "AGENT", "MULTI_AGENT", "EXTERNAL_SAAS"], isLibrary: false,
      datasetId: dataset.id, sourceRef: file.name,
    } });
    created.push(sc.code);
  }
  for (const sys of systems) await db.systemDataset.upsert({ where: { systemId_datasetId: { systemId: sys.id, datasetId: dataset.id } }, update: { purpose: "evaluation" }, create: { systemId: sys.id, datasetId: dataset.id, purpose: "evaluation" } });
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "library.scenarios_imported", entityType: "Dataset", entityId: dataset.id, summary: `${created.length} scenarios / ${promptCount} prompts imported from ${file.name} (${created[0]} … ${created[created.length - 1]}); dataset "${datasetName}"${systems.length ? `, linked to ${systems.length} system(s)` : ""}` } });
  revalidatePath("/library"); revalidatePath("/vendors"); revalidatePath("/plans/new"); revalidatePath("/evaluations/new");
  redirect(`/library?imported=${created.length}&prompts=${promptCount}`);
}
