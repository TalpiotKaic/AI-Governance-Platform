/**
 * Regenerate prisma/seed-data/i18n/library._source.json (translation skeleton for the test library:
 * method/scenario names, descriptions, instructions, target concepts, sectors, use cases, metric names,
 * annotation questions, questionnaire items, judge rubrics for display). Prompts are deliberately excluded —
 * they are the test inputs and must stay as authored.
 * Run: pnpm tsx scripts/build-library-i18n-source.ts
 */
import { writeFileSync } from "node:fs";
import { METHODS, SCENARIOS } from "../prisma/seed-data/library";

const out: Record<string, Record<string, Record<string, string | null>>> = { methods: {}, metrics: {}, scenarios: {}, annotations: {}, questionnaire: {} };
for (const m of METHODS) {
  out.methods[m.code] = { name: m.name, description: m.description, judgeRubric: m.judgeRubric && m.judgeRubric !== "n/a" ? m.judgeRubric : null };
  for (const s of m.metrics) out.metrics[`${m.code}|${s.key}`] = { name: s.name };
}
for (const s of SCENARIOS) {
  out.scenarios[s.code] = { name: s.name, sector: s.sector ?? null, useCase: s.useCase ?? null, targetConcept: s.targetConcept, description: s.description, instructions: s.instructions, tactic: s.tactic ?? null };
  for (const a of s.annotationSchema) out.annotations[`${s.code}|${a.key}`] = { question: a.question };
  for (const q of s.questionnaire ?? []) out.questionnaire[`${s.code}|${q.key}`] = { question: q.question };
}
const path = new URL("../prisma/seed-data/i18n/library._source.json", import.meta.url).pathname;
writeFileSync(path, JSON.stringify(out, null, 1) + "\n");
console.log(path, Object.fromEntries(Object.entries(out).map(([k, v]) => [k, Object.keys(v).length])));
