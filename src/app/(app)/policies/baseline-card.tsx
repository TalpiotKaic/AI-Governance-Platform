import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { Badge, toneForStatus } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BASELINE, BASELINE_KEYS, baselineTemplate } from "@/lib/baseline-documents";
import { docStatusLabel } from "@/lib/documents";
import type { Locale } from "@/lib/i18n/dict";
import { createBaselineDocumentsAction } from "./actions";

type Doc = { id: string; title: string; status: string; templateKey: string | null; updatedAt: Date };

/** The six starter documents; missing ones are created as drafts in one click. Collapses once all are in force. */
export function BaselineCard({ docs, locale, canWrite, t, L }: { docs: Doc[]; locale: Locale; canWrite: boolean; t: (s: string) => string; L: (s: string) => string }) {
  const latest = new Map<string, Doc>();
  for (const d of docs.filter((d) => d.templateKey && d.status !== "RETIRED").sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime())) latest.set(d.templateKey!, d);
  const missing = BASELINE_KEYS.filter((k) => !latest.has(k));
  const active = BASELINE_KEYS.filter((k) => latest.get(k)?.status === "ACTIVE").length;
  return (
    <Card id="baseline" className="mb-4 scroll-mt-20">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>{t("Baseline document set")} <span className="ml-1 text-sm font-normal text-muted">{active}/{BASELINE_KEYS.length} {t("in force")}</span></CardTitle>
          <CardDescription>{t("Six starter documents that cover the organisation-level requirements of ISO/IEC 42001, the EU AI Act, the NIST AI RMF and the AI Basic Act at once. Drafts are pre-filled with your organisation and AI inventory — replace the [ ] placeholders, request review, and they count as evidence for every system.")}</CardDescription>
        </div>
        {canWrite && missing.length > 0 && <form action={createBaselineDocumentsAction}><Button type="submit"><FilePlus2 className="h-4 w-4" /> {t("Create {n} draft(s)").replace("{n}", String(missing.length))}</Button></form>}
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {BASELINE_KEYS.map((k) => { const d = latest.get(k); return (
            <div key={k} className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm">
              <div className="min-w-0">
                {d ? <Link href={`/policies/${d.id}`} className="block truncate font-medium hover:underline">{d.title}</Link> : <span className="block truncate text-muted">{baselineTemplate(locale, k).title}</span>}
                <span className="text-[11px] text-muted">{L(`DOC_${BASELINE[k].docType}`)} · <span className="font-mono">{BASELINE[k].controlCodes.join(", ")}</span></span>
              </div>
              {d ? <Badge tone={d.status === "EXPIRED" ? "danger" : d.status === "IN_REVIEW" ? "info" : toneForStatus(d.status)}>{docStatusLabel(d.status, t, L)}</Badge> : <Badge>{t("Not created")}</Badge>}
            </div>); })}
        </div>
      </CardContent>
    </Card>
  );
}
