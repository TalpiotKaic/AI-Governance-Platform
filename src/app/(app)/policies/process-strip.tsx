import { getI18n } from "@/lib/i18n/server";

/** The document workflow at a glance, so users know where a document is and what happens next. */
export async function ProcessStrip({ current }: { current?: "DRAFT" | "IN_REVIEW" | "ACTIVE" | "REVIEW" }) {
  const { t } = await getI18n();
  const steps: { key: string; title: string; text: string }[] = [
    { key: "DRAFT", title: t("1. Draft"), text: t("Write the text and/or attach the file; choose the controls it satisfies.") },
    { key: "IN_REVIEW", title: t("2. Review request"), text: t("A reviewer other than the author checks the content.") },
    { key: "ACTIVE", title: t("3. Approved · in force"), text: t("Published automatically as organisation-wide evidence; counts for every system.") },
    { key: "REVIEW", title: t("4. Periodic review · revision"), text: t("Reminder 30 days before the review date; confirm unchanged or issue a new version. Expired documents stop counting.") },
  ];
  return (
    <ol className="grid grid-cols-1 gap-2 md:grid-cols-4">
      {steps.map((s) => <li key={s.key} className={`rounded-lg border px-3 py-2 ${current === s.key ? "border-primary bg-primary-soft/30" : "border-border bg-surface"}`}><p className="text-xs font-semibold">{s.title}</p><p className="mt-0.5 text-[11px] leading-snug text-muted">{s.text}</p></li>)}
    </ol>
  );
}
