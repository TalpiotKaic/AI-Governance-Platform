// Render-time localisation of auto-generated risk text (intake seeds, vendor due-diligence risks,
// test-finding risks, incident risks). Stored text stays English; user-written titles pass through unchanged.
import { translate, type Locale } from "./dict";
import { localizeScenario } from "./library";
import { SCENARIOS } from "../../../prisma/seed-data/library";

const fill = (s: string, vars: Record<string, string>) => Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, v), s);
const scenarioCodeByName = new Map(SCENARIOS.map((s) => [s.name, s.code]));

function scenarioName(locale: Locale, name: string) {
  const code = scenarioCodeByName.get(name);
  return code ? localizeScenario(locale, { code, name }).name : name;
}

export function localizeRiskTitle(locale: Locale, title: string): string {
  if (locale === "en") return title;
  let m = title.match(/^Vendor risk: (.+)$/);
  if (m) return fill(translate(locale, "Vendor risk: {name}"), { name: m[1] });
  m = title.match(/^Test finding: (.+)$/);
  if (m) return fill(translate(locale, "Test finding: {name}"), { name: scenarioName(locale, m[1]) });
  m = title.match(/^Incident (INC-\d+): (.+)$/);
  if (m) return fill(translate(locale, "Incident {code}: {title}"), { code: m[1], title: m[2] });
  return translate(locale, title); // intake seed titles are dictionary keys; anything else falls back to itself
}

export function localizeRiskDescription(locale: Locale, desc: string | null | undefined): string {
  if (!desc) return "";
  if (locale === "en") return desc;
  let m = desc.match(/^Third-party vendor "(.+?)" \((.+?)\) scored (\d+)\/100 in due diligence and is linked to a high-risk system\.(?:\s*Data exposed: (.+?)\.)?$/);
  if (m) return fill(translate(locale, 'Third-party vendor "{name}" ({role}) scored {score}/100 in due diligence and is linked to a high-risk system.'), { name: m[1], role: m[2], score: m[3] }) + (m[4] ? " " + fill(translate(locale, "Data exposed: {data}."), { data: m[4] }) : "");
  m = desc.match(/^Prompt (\S+) \((.+?)\) produced a violation of the target concept "(.+?)"\. Violated annotation items: (.+)\.$/);
  if (m) return fill(translate(locale, 'Prompt {id} ({type}) produced a violation of the target concept "{concept}". Violated annotation items: {items}.'), { id: m[1], type: translate(locale, m[2]), concept: m[3], items: m[4] });
  return translate(locale, desc); // demo seed descriptions are dictionary keys; anything else falls back to itself
}

export function localizeRiskMitigation(locale: Locale, text: string | null | undefined): string {
  return text ? translate(locale, text) : "";
}
