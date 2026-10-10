import { requirePagePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { getI18n } from "@/lib/i18n/server";
import { localizeControl } from "@/lib/i18n/content";
import { PageHeader } from "@/components/ui/page-header";
import { DOC_TYPES, REVIEW_CYCLES, SUGGESTED_CONTROLS } from "@/lib/documents";
import { saveDocumentAction } from "../actions";
import { DocumentForm } from "../document-form";
import { ProcessStrip } from "../process-strip";

export const metadata = { title: "New document" };

export default async function NewDocumentPage(props: PageProps<"/policies/new">) {
  const { locale, t } = await getI18n();
  await requirePagePermission("policies.write");
  const sp = await props.searchParams;
  const controls = (await db.control.findMany({ orderBy: { sortOrder: "asc" } })).map((c) => localizeControl(locale, c)).map((c) => ({ code: c.code, name: c.name }));
  return (
    <>
      <PageHeader title={t("New document")} crumbs={[{ label: t("Policies & documents"), href: "/policies" }, { label: t("New document") }]} description={t("Organisation-level governance documents (policies, procedures, roles, objectives, plans, records rules) are written and approved here once and count for every AI system.")} />
      <div className="mb-4"><ProcessStrip current="DRAFT" /></div>
      {sp.error === "title" && <p className="mb-3 rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger">{t("Enter a title.")}</p>}
      <DocumentForm action={saveDocumentAction.bind(null, null)} cancelHref="/policies" controls={controls} docTypes={DOC_TYPES} cycles={REVIEW_CYCLES} suggestions={SUGGESTED_CONTROLS} />
    </>
  );
}
