// Localised framework content (framework names, requirement text, control names).
// Source of truth stays in the database (English, or Korean for KR_AI_BASIC_ACT);
// translations live in prisma/seed-data/i18n/<locale>.json and are looked up at render time,
// so existing databases need no migration or re-seed. Missing entries fall back to the stored text.
import type { Locale } from "./dict";
import en from "../../../prisma/seed-data/i18n/en.json";
import ko from "../../../prisma/seed-data/i18n/ko.json";
import de from "../../../prisma/seed-data/i18n/de.json";
import fr from "../../../prisma/seed-data/i18n/fr.json";
import it from "../../../prisma/seed-data/i18n/it.json";
import es from "../../../prisma/seed-data/i18n/es.json";

type FrameworkText = { name?: string | null; description?: string | null };
type RequirementText = { title?: string | null; description?: string | null; category?: string | null; evidenceHint?: string | null };
type ControlText = { name?: string | null; category?: string | null };
export type FrameworkI18n = { frameworks: Record<string, FrameworkText>; requirements: Record<string, RequirementText>; controls: Record<string, ControlText> };

const EMPTY: FrameworkI18n = { frameworks: {}, requirements: {}, controls: {} };
const PACKS: Partial<Record<Locale, FrameworkI18n>> = { en: en as FrameworkI18n, ko: ko as FrameworkI18n, de: de as FrameworkI18n, fr: fr as FrameworkI18n, it: it as FrameworkI18n, es: es as FrameworkI18n };
const pack = (locale: Locale): FrameworkI18n => PACKS[locale] ?? EMPTY;
const pick = (v: string | null | undefined, fallback: string): string => (v && v.trim() ? v : fallback);
const pickOpt = (v: string | null | undefined, fallback: string | null | undefined): string | null => (v && v.trim() ? v : (fallback ?? null));

export function localizeFramework<T extends { code: string; name: string; description?: string | null }>(locale: Locale, fw: T): T {
  const x = pack(locale).frameworks[fw.code];
  if (!x) return fw;
  return { ...fw, name: pick(x.name, fw.name), description: pickOpt(x.description, fw.description) };
}

export function localizeRequirement<T extends { ref: string; title: string; description?: string | null; category?: string | null; evidenceHint?: string | null }>(locale: Locale, frameworkCode: string, r: T): T {
  const x = pack(locale).requirements[`${frameworkCode}|${r.ref}`];
  if (!x) return r;
  return { ...r, title: pick(x.title, r.title), description: pickOpt(x.description, r.description), category: pickOpt(x.category, r.category), evidenceHint: pickOpt(x.evidenceHint, r.evidenceHint) };
}

export function localizeControl<T extends { code: string; name: string; category?: string | null }>(locale: Locale, c: T): T {
  const x = pack(locale).controls[c.code];
  if (!x) return c;
  return { ...c, name: pick(x.name, c.name), category: pickOpt(x.category, c.category) };
}

/** Localised category label for a requirement (used for grouping headings). */
export function requirementCategory(locale: Locale, frameworkCode: string, r: { ref: string; category?: string | null }): string | null {
  return pickOpt(pack(locale).requirements[`${frameworkCode}|${r.ref}`]?.category, r.category);
}
