"use client";
import { useActionState } from "react";
import Link from "next/link";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { commitImportAction, previewImportAction, type ImportPreview } from "./actions";

export function ImportForm() {
  const { t, locale } = useI18n();
  const [preview, previewAction, previewing] = useActionState(previewImportAction, {} as ImportPreview);
  const [commit, commitAction, committing] = useActionState(commitImportAction, {} as ImportPreview);
  const rows = preview.rows ?? [];
  const invalid = rows.filter((r) => r.errors.length);
  const valid = preview.validCount ?? 0;
  return (
    <div className="space-y-4">
      <Card><CardHeader><CardTitle>{t("1. Download the template")}</CardTitle><CardDescription>{t("The template has one row per system, dropdowns for every coded field, Yes/No lists, header notes and a Guide sheet. Column headers and dropdowns follow your current UI language; files filled in any supported language can be uploaded.")}</CardDescription></CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <a href={`/api/systems/template?l=${locale}`}><Button variant="outline"><Download className="h-4 w-4" /> {t("Download Excel template")}</Button></a>
          <span className="text-xs text-muted">{t("Required columns are marked with *; purple columns apply to agents only.")}</span>
        </CardContent></Card>

      <Card><CardHeader><CardTitle>{t("2. Upload the completed file")}</CardTitle><CardDescription>{t("The file is validated first. Nothing is registered until you confirm in step 3.")}</CardDescription></CardHeader>
        <CardContent>
          <form action={previewAction} className="flex flex-wrap items-center gap-2">
            <input name="file" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required className="text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-surface-2 file:px-3 file:py-1.5 file:text-xs file:font-medium" />
            <Button type="submit" disabled={previewing}><Upload className="h-4 w-4" /> {previewing ? t("Validating…") : t("Validate file")}</Button>
          </form>
          {preview.error && <p className="mt-3 rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger">{t(preview.error)}{preview.missingColumns?.length ? ` — ${preview.missingColumns.join(", ")}` : ""}</p>}
        </CardContent></Card>

      {rows.length > 0 && (
        <Card><CardHeader><CardTitle>{t("3. Review and register")}</CardTitle>
          <CardDescription><FileSpreadsheet className="mr-1 inline h-3.5 w-3.5" />{preview.fileName} · {rows.length} {t("rows")} · <span className="text-success">{valid} {t("valid")}</span>{invalid.length > 0 && <> · <span className="text-danger">{invalid.length} {t("with errors")}</span></>}</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {invalid.length > 0 && <p className="text-sm text-muted">{t("Rows with errors are skipped. Fix them in the file and upload again, or register the valid rows now and add the rest later.")}</p>}
            {(preview.existingNames?.length ?? 0) > 0 && <p className="rounded-md border border-warning/40 bg-warning-soft px-3 py-2 text-xs text-warning">{t("Already registered in this organisation (a second record will be created):")} {preview.existingNames!.join(", ")}</p>}
            <div className="max-h-[28rem] overflow-auto rounded-md border border-border">
              <Table><THead><TR><TH className="w-16">{t("Row")}</TH><TH>{t("System name")}</TH><TH>{t("Status")}</TH><TH>{t("Issues")}</TH></TR></THead><TBody>
                {rows.map((r) => <TR key={r.row}><TD className="font-mono text-xs text-muted">{r.row}</TD><TD className="whitespace-nowrap font-medium">{r.name}</TD><TD>{r.errors.length ? <Badge tone="danger">{t("Error")}</Badge> : <Badge tone="success">{t("Ready")}</Badge>}</TD><TD className="text-xs text-muted">{r.errors.join(" · ") || "—"}</TD></TR>)}
              </TBody></Table>
            </div>
            <form action={commitAction} className="flex flex-wrap items-center justify-between gap-2">
              <input type="hidden" name="payload" value={preview.payload ?? "[]"} />
              <span className="text-xs text-muted">{t("Each system is registered exactly as from the form: intake tier, seeded risks and the approval workflow are created automatically.")}</span>
              <div className="flex items-center gap-2">
                <Link href="/systems"><Button type="button" variant="ghost">{t("Cancel")}</Button></Link>
                <Button type="submit" disabled={committing || valid === 0}>{committing ? t("Registering…") : `${t("Register")} ${valid} ${t("systems")}`}</Button>
              </div>
            </form>
            {commit.error && <p className="rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger">{t(commit.error)}</p>}
          </CardContent></Card>
      )}
    </div>
  );
}
