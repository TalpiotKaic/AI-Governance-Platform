// Localised test-library metadata (method/scenario names, descriptions, instructions, target concepts,
// metric names, annotation questions, questionnaire items, judge rubrics for display).
// Prompts, judge logic and rule checks are never translated: the stored English is the test itself.
// Translations live in prisma/seed-data/i18n/library.<locale>.json; missing entries fall back to the stored text.
import type { Locale } from "./dict";
import ko from "../../../prisma/seed-data/i18n/library.ko.json";
import de from "../../../prisma/seed-data/i18n/library.de.json";
import fr from "../../../prisma/seed-data/i18n/library.fr.json";
import it from "../../../prisma/seed-data/i18n/library.it.json";
import es from "../../../prisma/seed-data/i18n/library.es.json";

type Text = Record<string, string | null | undefined>;
export type LibraryI18n = { methods: Record<string, Text>; metrics: Record<string, Text>; scenarios: Record<string, Text>; annotations: Record<string, Text>; questionnaire: Record<string, Text> };
const EMPTY: LibraryI18n = { methods: {}, metrics: {}, scenarios: {}, annotations: {}, questionnaire: {} };
const PACKS: Partial<Record<Locale, LibraryI18n>> = { ko: ko as LibraryI18n, de: de as LibraryI18n, fr: fr as LibraryI18n, it: it as LibraryI18n, es: es as LibraryI18n };
const pack = (l: Locale) => PACKS[l] ?? EMPTY;
const pick = (v: string | null | undefined, fb: string) => (v && v.trim() ? v : fb);
const pickOpt = (v: string | null | undefined, fb: string | null | undefined) => (v && v.trim() ? v : (fb ?? null));

export function localizeMethod<T extends { code: string; name: string; description?: string | null; judgeRubric?: string | null }>(locale: Locale, m: T): T {
  const x = pack(locale).methods[m.code];
  if (!x) return m;
  return { ...m, name: pick(x.name, m.name), description: pickOpt(x.description, m.description), judgeRubric: pickOpt(x.judgeRubric, m.judgeRubric) };
}
export function localizeScenario<T extends { code: string; name: string; description?: string | null; instructions?: string | null; targetConcept?: string | null; sector?: string | null; useCase?: string | null; tactic?: string | null }>(locale: Locale, s: T): T {
  const x = pack(locale).scenarios[s.code];
  if (!x) return s;
  return { ...s, name: pick(x.name, s.name), description: pickOpt(x.description, s.description), instructions: pickOpt(x.instructions, s.instructions), targetConcept: pickOpt(x.targetConcept, s.targetConcept), sector: pickOpt(x.sector, s.sector), useCase: pickOpt(x.useCase, s.useCase), tactic: pickOpt(x.tactic, s.tactic) };
}
/** Metric display name by metric key (keys are unique across methods); falls back to the stored name. */
export function localizeMetricName(locale: Locale, metricKey: string, fallback: string): string {
  const p = pack(locale).metrics;
  const hit = Object.keys(p).find((k) => k.endsWith(`|${metricKey}`));
  return hit ? pick(p[hit].name, fallback) : fallback;
}
export function localizeAnnotationQuestion(locale: Locale, scenarioCode: string, itemKey: string, fallback: string): string {
  return pick(pack(locale).annotations[`${scenarioCode}|${itemKey}`]?.question, fallback);
}
export function localizeQuestionnaireItem(locale: Locale, scenarioCode: string, itemKey: string, fallback: string): string {
  return pick(pack(locale).questionnaire[`${scenarioCode}|${itemKey}`]?.question, fallback);
}
