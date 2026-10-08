"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/server";
import { parseSystemsWorkbook, type ParsedRow } from "@/lib/import/systems-xlsx";
import { createSystemRecord, systemSchema, type SystemInput } from "@/lib/systems/create";

export type ImportPreview = {
  fileName?: string;
  rows?: Omit<ParsedRow, "data">[];
  validCount?: number;
  payload?: string; // JSON of valid rows (re-validated on commit)
  error?: string;
  missingColumns?: string[];
  existingNames?: string[];
};

const MAX_BYTES = 8 * 1024 * 1024;

export async function previewImportAction(_prev: ImportPreview, formData: FormData): Promise<ImportPreview> {
  const user = await requirePermission("systems.write");
  const locale = await getLocale();
  const file = formData.get("file");
  if (!file || typeof file !== "object" || !("arrayBuffer" in file) || file.size === 0) return { error: "Choose an .xlsx file first." };
  if (file.size > MAX_BYTES) return { error: "File is too large (max 8 MB)." };
  if (!/\.xlsx$/i.test(file.name)) return { error: "Only .xlsx files produced from the template are supported." };
  let parsed;
  try { parsed = await parseSystemsWorkbook(Buffer.from(await file.arrayBuffer()), locale); }
  catch { return { error: "The file could not be read as an Excel workbook." }; }
  if (!parsed.sheetFound) return { error: "No 'Systems' sheet found. Download the template and fill in the Systems sheet." };
  if (parsed.missingColumns.length) return { fileName: file.name, missingColumns: parsed.missingColumns, error: "Required columns are missing." };
  if (parsed.rows.length === 0) return { fileName: file.name, rows: [], validCount: 0, error: "The Systems sheet has no data rows." };
  // names already registered in this organisation → warn, still importable (codes differ)
  const names = parsed.rows.map((r) => r.name);
  const existing = await db.aiSystem.findMany({ where: { orgId: user.orgId, name: { in: names, mode: "insensitive" } }, select: { name: true } });
  const valid = parsed.rows.filter((r) => r.data);
  return {
    fileName: file.name,
    rows: parsed.rows.map(({ row, name, errors }) => ({ row, name, errors })),
    validCount: valid.length,
    payload: JSON.stringify(valid.map((r) => r.data)),
    existingNames: existing.map((e) => e.name),
  };
}

export async function commitImportAction(_prev: ImportPreview, formData: FormData): Promise<ImportPreview> {
  const user = await requirePermission("systems.write");
  const raw = String(formData.get("payload") || "[]");
  let items: unknown[];
  try { items = JSON.parse(raw) as unknown[]; } catch { return { error: "Invalid import payload." }; }
  if (!Array.isArray(items) || items.length === 0) return { error: "Nothing to import." };
  if (items.length > 500) return { error: "At most 500 systems can be imported per upload." };
  const inputs: SystemInput[] = [];
  for (const it of items) { const p = systemSchema.safeParse(it); if (!p.success) return { error: "Invalid import payload." }; inputs.push(p.data); }
  const created: string[] = [];
  for (const d of inputs) { const { system } = await createSystemRecord(user, d, { source: "Excel import" }); created.push(system.code); }
  await db.auditLog.create({ data: { orgId: user.orgId, actorId: user.id, action: "system.bulk_imported", entityType: "AiSystem", summary: `${created.length} systems imported from Excel (${created[0]} … ${created[created.length - 1]})` } });
  revalidatePath("/systems");
  redirect(`/systems?imported=${created.length}`);
}
