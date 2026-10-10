"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";

type Props = {
  action: (fd: FormData) => void | Promise<void>;
  cancelHref: string;
  controls: { code: string; name: string }[];
  docTypes: string[];
  cycles: number[];
  suggestions: Record<string, string[]>;
  initial?: { title: string; docType: string; version: string; reviewCycleMonths: number; content: string; controlCodes: string[]; fileName: string | null };
};

/** Create / edit a governance document draft: body text (Markdown) and/or a file, linked controls, review cycle. */
export function DocumentForm({ action, cancelHref, controls, docTypes, cycles, suggestions, initial }: Props) {
  const { t, L } = useI18n();
  const [docType, setDocType] = useState(initial?.docType ?? "POLICY");
  const [codes, setCodes] = useState<string[]>(initial?.controlCodes ?? suggestions[initial?.docType ?? "POLICY"] ?? []);
  const [touched, setTouched] = useState(!!initial);
  const [picked, setPicked] = useState<string | null>(null);
  const [removeFile, setRemoveFile] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const toggle = (c: string) => { setTouched(true); setCodes((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c])); };
  return (
    <form action={action} className="space-y-4">
      <Card><CardHeader><CardTitle>{t("1. Document")}</CardTitle></CardHeader><CardContent className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Field label={t("Title")} className="md:col-span-2"><Input name="title" required defaultValue={initial?.title ?? ""} placeholder={t("e.g. AI roles and responsibilities (RACI)")} /></Field>
        <Field label={t("Document type")}><Select name="docType" value={docType} onChange={(e) => { setDocType(e.target.value); if (!touched) setCodes(suggestions[e.target.value] ?? []); }}>{docTypes.map((d) => <option key={d} value={d}>{L(`DOC_${d}`)}</option>)}</Select></Field>
        <Field label={t("Version")}><Input name="version" defaultValue={initial?.version ?? "1.0"} /></Field>
        <Field label={t("Review cycle")} hint={t("The next review date is set from the approval date. You are reminded 30 days before; after the date the document expires and stops counting as evidence.")} className="md:col-span-2"><Select name="reviewCycleMonths" defaultValue={String(initial?.reviewCycleMonths ?? 12)}>{cycles.map((c) => <option key={c} value={c}>{t("Every {n} months").replace("{n}", String(c))}</option>)}</Select></Field>
      </CardContent></Card>

      <Card><CardHeader><CardTitle>{t("2. Content")}</CardTitle><CardDescription>{t("Write the document here (Markdown or plain text: # headings, - lists, | tables |) and/or attach the signed original. At least one of the two is required before review.")}</CardDescription></CardHeader><CardContent className="space-y-3">
        <Textarea name="content" rows={16} defaultValue={initial?.content ?? ""} className="font-mono text-xs" placeholder={t("# Purpose\n\n# Scope\n\n# Roles and responsibilities\n\n| Activity | Responsible | Accountable |\n|---|---|---|\n| AI risk assessment | AI risk owner | CISO |")} />
        <div className="flex flex-wrap items-center gap-2">
          <input ref={fileRef} name="file" type="file" accept=".md,.markdown,.txt,.pdf,.doc,.docx,.hwp,.hwpx,.xlsx,.pptx,.odt" className="sr-only" onChange={(e) => setPicked(e.target.files?.[0]?.name ?? null)} />
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}><FileText className="h-4 w-4" /> {t("Attach file")}</Button>
          <span className="text-xs text-muted">{picked ?? (initial?.fileName && !removeFile ? `${t("Current file")}: ${initial.fileName}` : t("No file selected"))}</span>
          {initial?.fileName && !picked && <label className="flex items-center gap-1 text-xs text-muted"><input type="checkbox" name="removeFile" value="1" checked={removeFile} onChange={(e) => setRemoveFile(e.target.checked)} className="accent-[var(--primary)]" />{t("Remove current file")}</label>}
          <span className="text-[11px] text-muted">{t("MD, TXT, PDF, DOCX, HWP, XLSX, PPTX · max 10 MB")}</span>
        </div>
      </CardContent></Card>

      <Card><CardHeader><CardTitle>{t("3. Controls this document satisfies")}</CardTitle><CardDescription>{t("Once approved, the document is published as organisation-wide evidence for these controls and counts for every AI system. Suggested controls are pre-selected by document type.")}</CardDescription></CardHeader><CardContent>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">{controls.map((c) => <label key={c.code} className={`flex cursor-pointer items-center gap-2 rounded border px-2 py-1 text-xs ${codes.includes(c.code) ? "border-primary/60 bg-primary-soft/30" : "border-border"}`}><input type="checkbox" name="controlCodes" value={c.code} checked={codes.includes(c.code)} onChange={() => toggle(c.code)} className="accent-[var(--primary)]" /><span><span className="font-mono text-muted">{c.code}</span> {c.name}</span></label>)}</div>
      </CardContent></Card>

      <div className="flex justify-end gap-2"><Link href={cancelHref}><Button type="button" variant="ghost">{t("Cancel")}</Button></Link><Button type="submit">{t("Save draft")}</Button></div>
    </form>
  );
}
