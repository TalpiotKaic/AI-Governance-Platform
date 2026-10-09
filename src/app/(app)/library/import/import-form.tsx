"use client";
import { useActionState, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FileJson, Upload } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox, Field, Input } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { buildScenarioDrafts, parseEvalJsonl, type Lang, type ParsedJsonl } from "@/lib/library/import-jsonl";
import { importScenariosAction, type ImportScenariosState } from "./actions";

export function ImportScenariosForm({ systems }: { systems: { id: string; code: string; name: string }[] }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState(importScenariosAction, {} as ImportScenariosState);
  const [picked, setPicked] = useState<{ name: string; size: number } | null>(null);
  const [parsed, setParsed] = useState<ParsedJsonl | null>(null);
  const [langs, setLangs] = useState<Lang[]>([]);
  const [readError, setReadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const fmt = (key: string, vars: Record<string, string | number>) => Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), t(key));
  const drafts = useMemo(() => (parsed ? buildScenarioDrafts(parsed.records, langs) : []), [parsed, langs]);
  const promptCount = drafts.reduce((n, d) => n + d.prompts.length, 0);
  const defaultName = picked ? picked.name.replace(/\.(jsonl|json|ndjson)$/i, "") : "";

  const onPick = async (f: File | undefined) => {
    setParsed(null); setReadError(null); setLangs([]);
    setPicked(f ? { name: f.name, size: f.size } : null);
    if (!f) return;
    try {
      const p = parseEvalJsonl(await f.text());
      setParsed(p); setLangs(p.languages);
      if (!p.records.length) setReadError("No usable records found. Expected one JSON object per line with risk_axis, id and messages / prompt.");
    } catch { setReadError("The file could not be read."); }
  };

  return (
    <form action={action} className="space-y-4">
      <Card><CardHeader><CardTitle>{t("1. Choose the JSONL file")}</CardTitle><CardDescription>{t("Accepted: risk_paired.jsonl (ko + en in one record) or the flattened risk_ko.jsonl / risk_en_eu.jsonl. Knowledge-track files (eval_*.jsonl) are not imported yet.")}</CardDescription></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <input ref={fileRef} name="file" type="file" accept=".jsonl,.json,.ndjson,application/jsonl,application/x-ndjson,application/json" required className="sr-only" onChange={(e) => onPick(e.target.files?.[0])} />
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}><FileJson className="h-4 w-4" /> {t("Choose file")}</Button>
            <span className="text-sm text-muted">{picked ? `${picked.name} · ${(picked.size / 1024).toFixed(0)} KB` : t("No file selected")}</span>
          </div>
          {readError && <p className="mt-3 rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger">{t(readError)}</p>}
          {parsed && parsed.records.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Badge tone="success">{fmt("{n} records", { n: parsed.records.length })}</Badge>
              <Badge tone="info">{t("Languages")}: {parsed.languages.map((l) => l.toUpperCase()).join(", ")}</Badge>
              {parsed.asOf && <Badge>{t("As of")} {parsed.asOf}</Badge>}
              {parsed.invalidLines.length > 0 && <Badge tone="danger">{fmt("{n} invalid lines skipped", { n: parsed.invalidLines.length })}</Badge>}
              {parsed.skipped.length > 0 && <Badge tone="warning">{fmt("{n} non-risk records skipped", { n: parsed.skipped.length })}</Badge>}
            </div>
          )}
        </CardContent></Card>

      {parsed && parsed.records.length > 0 && (
        <>
          <Card><CardHeader><CardTitle>{t("2. Import options")}</CardTitle><CardDescription>{t("The file is registered in the dataset register (Vendors & datasets) as an evaluation dataset; the scenarios below reference it. Linking systems now is optional — a plan or run that uses these scenarios links the dataset to that system automatically.")}</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label={t("Dataset name")}><Input name="datasetName" key={defaultName} defaultValue={defaultName} required /></Field>
              <Field label={t("Version")}><Input name="version" key={parsed.asOf ?? "v"} defaultValue={parsed.asOf ?? ""} placeholder="2026-09" /></Field>
              <Field label={t("Source")} className="md:col-span-2"><Input name="source" defaultValue="Evaluation-Dataset-Generator (JSONL)" /></Field>
              <Field label={t("Languages to import")}>
                <div className="flex flex-wrap gap-4 pt-1">{parsed.languages.map((l) => <Checkbox key={l} name="langs" value={l} label={l === "ko" ? t("Korean prompts") : t("English prompts")} checked={langs.includes(l)} onChange={(e) => setLangs((cur) => e.target.checked ? [...cur, l] : cur.filter((x) => x !== l))} />)}</div>
              </Field>
              <Field label={t("Link as evaluation dataset of (optional)")}>
                <div className="max-h-40 space-y-1 overflow-auto rounded-md border border-border p-2">{systems.length ? systems.map((s) => <Checkbox key={s.id} name="systemIds" value={s.id} label={`${s.code} · ${s.name}`} />) : <span className="text-xs text-muted">{t("No AI systems registered yet.")}</span>}</div>
              </Field>
            </CardContent></Card>

          <Card><CardHeader><CardTitle>{t("3. Scenarios to be created")}</CardTitle>
            <CardDescription>{fmt("{n} scenarios", { n: drafts.length })} · {fmt("{n} prompts", { n: promptCount })} · {t("one scenario per risk axis × domain, mapped to the test method whose metrics it feeds")}</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="max-h-[28rem] overflow-auto rounded-md border border-border">
                <Table><THead><TR><TH>{t("Scenario")}</TH><TH>{t("Method")}</TH><TH>{t("Prompts")}</TH><TH>{t("Benign controls")}</TH><TH>{t("Severity")}</TH><TH>{t("Tactic")}</TH></TR></THead><TBody>
                  {drafts.map((d) => <TR key={d.key}><TD className="font-medium">{d.name}</TD><TD className="font-mono text-xs">{d.methodCode}</TD><TD className="tabular-nums">{d.prompts.length}</TD><TD className="tabular-nums">{d.benignCount}</TD><TD className="text-xs">{d.defaultSeverity}</TD><TD className="text-xs text-muted">{d.tactic ?? "—"}</TD></TR>)}
                </TBody></Table>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-muted">{t("Prompts are stored exactly as authored (never translated). R7 prompts use the TM-15 method (overreliance & professional-advice limits), created on first import if missing.")}</span>
                <div className="flex items-center gap-2">
                  <Link href="/library"><Button type="button" variant="ghost">{t("Cancel")}</Button></Link>
                  <Button type="submit" disabled={pending || drafts.length === 0 || langs.length === 0}><Upload className="h-4 w-4" /> {pending ? t("Importing…") : fmt("Import {n} scenarios", { n: drafts.length })}</Button>
                </div>
              </div>
              {state.error && <p className="rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger">{t(state.error)}</p>}
            </CardContent></Card>
        </>
      )}
    </form>
  );
}
