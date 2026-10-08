import ExcelJS from "exceljs";
import { LOCALES, translate, type Locale } from "@/lib/i18n/dict";
import { labelFor } from "@/lib/i18n/labels";
import { enumLabel } from "@/lib/utils";
import { systemSchema, type SystemInput } from "@/lib/systems/create";
import { ANNEX_III_AREAS, annexAreaValue } from "@/lib/eu-ai-act";

/**
 * Excel template + parser for bulk AI-inventory registration.
 * Headers, dropdown labels and the guide sheet follow the UI language; the parser accepts
 * headers and dropdown values in any supported language (or the raw enum code).
 */
type Kind = "text" | "long" | "enum" | "bool" | "number" | "suggest";
export interface ImportColumn { key: keyof SystemInput; header: string; kind: Kind; required?: boolean; options?: readonly string[]; note: string; example: string; agentOnly?: boolean }

export const SYSTEM_TYPES = ["PREDICTIVE_ML", "LLM_APPLICATION", "RAG_ASSISTANT", "AGENT", "MULTI_AGENT", "EXTERNAL_SAAS"] as const;
export const LIFECYCLE_STAGES = ["PLANNED", "DEVELOPMENT", "TESTING", "APPROVED", "PRODUCTION", "RETIRED"] as const;
export const EU_CATEGORIES = ["UNCLASSIFIED", "MINIMAL", "LIMITED_TRANSPARENCY", "HIGH_RISK", "PROHIBITED", "GPAI", "GPAI_SYSTEMIC"] as const;
export const AUTONOMY_LEVELS = ["ASSISTIVE", "SUPERVISED", "AUTONOMOUS"] as const;

export const COLUMNS: ImportColumn[] = [
  { key: "name", header: "System name", kind: "text", required: true, note: "Unique, human-readable name (at least 2 characters).", example: "AcmeAssist Customer Service Agent" },
  { key: "type", header: "System type", kind: "enum", required: true, options: SYSTEM_TYPES, note: "Choose from the dropdown. Determines which test scenarios apply.", example: "AGENT" },
  { key: "lifecycleStage", header: "Lifecycle stage", kind: "enum", required: true, options: LIFECYCLE_STAGES, note: "Current stage of the system.", example: "DEVELOPMENT" },
  { key: "euAiActCategory", header: "EU AI Act category", kind: "enum", required: true, options: EU_CATEGORIES, note: "Risk classification under the EU AI Act. Drives the intake tier and approval workflow.", example: "LIMITED_TRANSPARENCY" },
  { key: "euAiActAnnexIIIArea", header: "Annex III area", kind: "suggest", note: "For high-risk systems only: pick one of the eight Annex III areas from the dropdown, or type your own wording.", example: "" },
  { key: "description", header: "Description", kind: "long", note: "What the system does and how it is used.", example: "Chatbot that answers policy questions and processes refunds via tools." },
  { key: "sector", header: "Sector", kind: "text", note: "Industry or business sector.", example: "Financial services" },
  { key: "purpose", header: "Intended purpose", kind: "long", note: "Intended purpose as documented for conformity assessment.", example: "Reduce first-line support workload" },
  { key: "deploymentContext", header: "Deployment context", kind: "long", note: "Where and how it is deployed (channel, region, integration).", example: "Web and mobile app, EU and KR customers" },
  { key: "intendedUsers", header: "Intended users", kind: "text", note: "Who operates or uses the system.", example: "Customer support team, end customers" },
  { key: "affectedPersons", header: "Affected persons", kind: "text", note: "Natural persons whose rights or safety may be affected.", example: "Retail customers" },
  { key: "humanOversight", header: "Human oversight", kind: "long", note: "Oversight measures (approval gates, monitoring, stop controls).", example: "Refunds over $500 require human approval" },
  { key: "usesPersonalData", header: "Uses personal data", kind: "bool", required: true, note: "Yes / No.", example: "Yes" },
  { key: "usesSensitiveData", header: "Uses sensitive data", kind: "bool", required: true, note: "Yes / No — special categories (health, biometrics, etc.).", example: "No" },
  { key: "customerFacing", header: "Customer-facing", kind: "bool", required: true, note: "Yes / No — interacts directly with natural persons.", example: "Yes" },
  { key: "automatedDecision", header: "Automated decision-making", kind: "bool", required: true, note: "Yes / No — makes or materially influences decisions about people.", example: "No" },
  { key: "geographies", header: "Geographies", kind: "text", note: "Comma-separated (e.g. EU, KR, US).", example: "EU, KR" },
  { key: "tags", header: "Tags", kind: "text", note: "Comma-separated keywords.", example: "customer-service, agent" },
  { key: "modelProvider", header: "Model provider", kind: "text", note: "e.g. Anthropic, OpenAI, in-house.", example: "Anthropic" },
  { key: "modelName", header: "Model name", kind: "text", note: "Primary model used.", example: "claude-sonnet-5-5" },
  { key: "modelVersion", header: "Model version", kind: "text", note: "Version or snapshot identifier.", example: "2026-09" },
  { key: "vendors", header: "Vendors", kind: "long", note: "One per line (Alt+Enter): name | role | service type | country. Existing vendors are matched by name, new ones are created. The model provider is linked as a vendor automatically.", example: "Anthropic | LLM provider | Foundation model API | US\nAWS (ap-northeast-2) | Hosting | Cloud hosting | KR" },
  { key: "datasets", header: "Datasets", kind: "long", note: "One per line (Alt+Enter): name | purpose | PII yes/no | sensitivity. Existing datasets are matched by name, new ones are created.", example: "Support knowledge base | retrieval | no | internal" },
  { key: "agentFramework", header: "Agent framework", kind: "text", agentOnly: true, note: "Agents only: LangGraph, CrewAI, AutoGen, custom, MCP…", example: "LangGraph" },
  { key: "autonomyLevel", header: "Autonomy level", kind: "enum", agentOnly: true, options: AUTONOMY_LEVELS, note: "Agents only. Defaults to Supervised.", example: "SUPERVISED" },
  { key: "tools", header: "Agent tools", kind: "long", agentOnly: true, note: "Agents only. One tool per line (Alt+Enter): name | riskLevel(low/medium/high/critical) | allowed(true/false) | permissions", example: "lookup_customer | medium | true | customer:read\ntransfer_funds | critical | true | account:write" },
  { key: "dataSources", header: "Agent data sources", kind: "long", agentOnly: true, note: "Agents only. One per line.", example: "Customer DB\nKnowledge base" },
  { key: "mcpServers", header: "MCP servers", kind: "long", agentOnly: true, note: "Agents only. One per line.", example: "" },
  { key: "killSwitch", header: "Kill switch", kind: "bool", agentOnly: true, note: "Agents only. Yes / No.", example: "Yes" },
  { key: "maxBudgetUsd", header: "Max budget (USD)", kind: "number", agentOnly: true, note: "Agents only. Spend cap per run/day.", example: "100" },
];

const SHEET = "Systems", LISTS = "Lists", GUIDE = "Guide";
const DATA_ROWS = 500;
const YES = ["Yes", "Y", "TRUE", "1", "예", "네", "O", "JA", "OUI", "SÌ", "SI", "SÍ"];
const NO = ["No", "N", "FALSE", "0", "아니오", "아니요", "X", "NEIN", "NON", "NO"];

const norm = (s: unknown) => String(s ?? "").replace(/\*/g, "").trim().toLowerCase();
function colLetter(n: number) { let s = ""; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }

export async function buildSystemsTemplate(locale: Locale): Promise<Buffer> {
  const t = (k: string) => translate(locale, k);
  const yes = t("Yes"), no = t("No");
  const wb = new ExcelJS.Workbook();
  wb.creator = "K-VeriAI";
  const ws = wb.addWorksheet(SHEET, { views: [{ state: "frozen", ySplit: 1 }] });
  const lists = wb.addWorksheet(LISTS, { state: "veryHidden" });
  const guide = wb.addWorksheet(GUIDE);

  // Lists sheet: one column per enum (localised labels), plus Yes/No
  let listCol = 1;
  const listRef: Record<string, string> = {};
  const addList = (name: string, values: string[]) => {
    const L = colLetter(listCol);
    lists.getCell(`${L}1`).value = name;
    values.forEach((v, i) => { lists.getCell(`${L}${i + 2}`).value = v; });
    listRef[name] = `${LISTS}!$${L}$2:$${L}$${values.length + 1}`;
    listCol++;
  };
  for (const c of COLUMNS) if (c.kind === "enum" && c.options) addList(c.key, c.options.map((o) => labelFor(locale, o)));
  addList("bool", [yes, no]);
  addList("annex", ANNEX_III_AREAS.map((a) => annexAreaValue(t, a)));

  // Header row
  ws.columns = COLUMNS.map((c) => ({ key: c.key, width: c.kind === "long" || c.kind === "suggest" ? 44 : c.kind === "bool" ? 16 : 24 }));
  const header = ws.getRow(1);
  COLUMNS.forEach((c, i) => {
    const cell = header.getCell(i + 1);
    cell.value = `${t(c.header)}${c.required ? " *" : ""}`;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: c.required ? "FF0F766E" : c.agentOnly ? "FF4F46E5" : "FF334155" } };
    cell.alignment = { vertical: "middle", wrapText: true };
    cell.note = { texts: [{ text: `${t(c.note)}${c.kind === "enum" ? `\n${t("Choose from the dropdown.")}` : ""}` }] };
  });
  header.height = 30;

  // Data validation for rows 2..DATA_ROWS+1
  COLUMNS.forEach((c, i) => {
    const L = colLetter(i + 1);
    for (let r = 2; r <= DATA_ROWS + 1; r++) {
      const cell = ws.getCell(`${L}${r}`);
      if (c.kind === "enum") cell.dataValidation = { type: "list", allowBlank: !c.required, formulae: [listRef[c.key]], showErrorMessage: true, errorStyle: "stop", errorTitle: t("Invalid value"), error: t("Choose a value from the dropdown.") };
      else if (c.kind === "bool") cell.dataValidation = { type: "list", allowBlank: !c.required, formulae: [listRef.bool], showErrorMessage: true, errorStyle: "stop", errorTitle: t("Invalid value"), error: t("Choose a value from the dropdown.") };
      else if (c.kind === "suggest") cell.dataValidation = { type: "list", allowBlank: true, formulae: [listRef.annex], showErrorMessage: true, errorStyle: "information", errorTitle: t("Custom value"), error: t("Not one of the Annex III areas — kept as free text.") };
      else if (c.kind === "number") cell.dataValidation = { type: "decimal", operator: "greaterThanOrEqual", allowBlank: true, formulae: [0], showErrorMessage: true, errorTitle: t("Invalid value"), error: t("Enter a number greater than or equal to 0.") };
      if (c.kind === "long") cell.alignment = { wrapText: true, vertical: "top" };
    }
  });
  ws.autoFilter = { from: "A1", to: `${colLetter(COLUMNS.length)}1` };

  // Guide sheet
  guide.columns = [{ width: 28 }, { width: 12 }, { width: 70 }, { width: 44 }];
  guide.addRow([t("K-VeriAI — AI inventory bulk registration template")]).font = { bold: true, size: 14 };
  guide.addRow([t("Fill one row per AI system in the 'Systems' sheet. Columns marked * are required. Use the dropdowns where provided; agent-only columns (purple) can be left empty for non-agent systems. Then upload the file at AI Inventory → Import from Excel.")]);
  guide.addRow([]);
  const gh = guide.addRow([t("Column"), t("Required"), t("Description"), t("Example")]);
  gh.font = { bold: true }; gh.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
  for (const c of COLUMNS) {
    const opts = c.kind === "enum" && c.options ? ` ${t("Options:")} ${c.options.map((o) => labelFor(locale, o)).join(" / ")}` : c.kind === "bool" ? ` ${t("Options:")} ${yes} / ${no}` : c.kind === "suggest" ? ` ${t("Options:")} ${ANNEX_III_AREAS.map((a) => annexAreaValue(t, a)).join(" / ")}` : "";
    const ex = c.kind === "enum" ? labelFor(locale, c.example) : c.kind === "bool" ? (c.example === "Yes" ? yes : no) : c.example;
    const row = guide.addRow([t(c.header), c.required ? "*" : "", `${t(c.note)}${opts}`, ex]);
    row.alignment = { wrapText: true, vertical: "top" };
  }
  guide.addRow([]);
  guide.addRow([t("Tip: the 'Systems' sheet accepts up to 500 rows per upload. Rows whose system name is empty are ignored.")]);

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

/* ─────────────── Parsing ─────────────── */
export interface ParsedRow { row: number; name: string; data?: SystemInput; errors: string[] }
export interface ParseResult { rows: ParsedRow[]; missingColumns: string[]; sheetFound: boolean }

function headerIndex(headerCells: unknown[]): Map<keyof SystemInput, number> {
  const map = new Map<keyof SystemInput, number>();
  const candidates = new Map<string, keyof SystemInput>();
  for (const c of COLUMNS) {
    candidates.set(norm(c.key), c.key);
    candidates.set(norm(c.header), c.key);
    for (const l of LOCALES) candidates.set(norm(translate(l, c.header)), c.key);
  }
  headerCells.forEach((h, i) => { const k = candidates.get(norm(h)); if (k && !map.has(k)) map.set(k, i); });
  return map;
}

function enumFromLabel(options: readonly string[], raw: string): string | undefined {
  const n = norm(raw);
  if (!n) return undefined;
  for (const o of options) {
    if (norm(o) === n || norm(enumLabel(o)) === n) return o;
    for (const l of LOCALES) if (norm(labelFor(l, o)) === n) return o;
  }
  return undefined;
}
function boolFromCell(raw: unknown): boolean | undefined {
  if (typeof raw === "boolean") return raw;
  const n = norm(raw).toUpperCase();
  if (!n) return undefined;
  if (YES.map((x) => x.toUpperCase()).includes(n)) return true;
  if (NO.map((x) => x.toUpperCase()).includes(n)) return false;
  for (const l of LOCALES) { if (norm(translate(l, "Yes")).toUpperCase() === n) return true; if (norm(translate(l, "No")).toUpperCase() === n) return false; }
  return undefined;
}
function cellText(v: ExcelJS.CellValue): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") {
    if ("richText" in v) return v.richText.map((r) => r.text).join("");
    if ("result" in v) return String(v.result ?? "");
    if ("text" in v) return String(v.text ?? "");
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    return "";
  }
  return String(v);
}

export async function parseSystemsWorkbook(buffer: Buffer, locale: Locale): Promise<ParseResult> {
  const t = (k: string) => translate(locale, k);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  const ws = wb.getWorksheet(SHEET) ?? wb.worksheets.find((w) => w.name !== LISTS && w.name !== GUIDE);
  if (!ws) return { rows: [], missingColumns: [], sheetFound: false };
  const headerCells: unknown[] = [];
  ws.getRow(1).eachCell({ includeEmpty: true }, (cell, col) => { headerCells[col - 1] = cellText(cell.value); });
  const idx = headerIndex(headerCells);
  const missingColumns = COLUMNS.filter((c) => c.required && !idx.has(c.key)).map((c) => t(c.header));
  const rows: ParsedRow[] = [];
  if (missingColumns.length) return { rows, missingColumns, sheetFound: true };

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const get = (k: keyof SystemInput) => { const i = idx.get(k); if (i === undefined) return ""; return cellText(row.getCell(i + 1).value).trim(); };
    const name = get("name");
    if (!name) return; // blank row
    const errors: string[] = [];
    const raw: Record<string, unknown> = {};
    for (const c of COLUMNS) {
      const v = get(c.key);
      if (c.kind === "enum" && c.options) {
        if (!v) { if (c.required) errors.push(`${t(c.header)}: ${t("required")}`); else raw[c.key] = undefined; continue; }
        const code = enumFromLabel(c.options, v);
        if (!code) errors.push(`${t(c.header)}: ${t("unknown value")} "${v}"`); else raw[c.key] = code;
      } else if (c.kind === "bool") {
        const b = boolFromCell(row.getCell((idx.get(c.key) ?? 0) + 1).value ?? v);
        if (b === undefined) { if (c.required) errors.push(`${t(c.header)}: ${t("required")} (${t("Yes")}/${t("No")})`); else raw[c.key] = undefined; } else raw[c.key] = b;
      } else if (c.kind === "number") {
        if (v && Number.isNaN(Number(v))) errors.push(`${t(c.header)}: ${t("must be a number")}`); else raw[c.key] = v || undefined;
      } else {
        raw[c.key] = v || undefined;
      }
    }
    if (name.length < 2) errors.push(`${t("System name")}: ${t("at least 2 characters")}`);
    const parsed = systemSchema.safeParse(raw);
    if (!parsed.success) {
      // only surface schema issues for fields that do not already carry a friendlier message
      const reported = new Set(errors.map((e) => e.split(":")[0]));
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        const col = COLUMNS.find((c) => c.key === key);
        const label = col ? t(col.header) : key;
        if (reported.has(label)) continue;
        const msg = issue.code === "too_small" ? t("value is too short") : issue.code === "too_big" ? t("value is too long") : issue.code === "invalid_value" ? t("unknown value") : issue.code === "invalid_type" ? t("required") : t("invalid value");
        errors.push(`${label}: ${msg}`);
      }
    }
    rows.push({ row: rowNumber, name, data: parsed.success && errors.length === 0 ? parsed.data : undefined, errors });
  });
  // duplicate names inside the file
  const seen = new Map<string, number>();
  for (const r of rows) { const k = r.name.toLowerCase(); if (seen.has(k)) { r.errors.push(`${t("Duplicate system name in file (row")} ${seen.get(k)})`); r.data = undefined; } else seen.set(k, r.row); }
  return { rows, missingColumns, sheetFound: true };
}
