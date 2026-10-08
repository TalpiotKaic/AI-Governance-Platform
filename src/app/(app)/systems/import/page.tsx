import { requirePagePermission } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui/page-header";
import { ImportForm } from "./import-form";

export const metadata = { title: "Import AI systems from Excel" };

export default async function ImportSystemsPage() {
  const { t } = await getI18n();
  await requirePagePermission("systems.write");
  return (
    <>
      <PageHeader title={t("Import from Excel")} crumbs={[{ label: t("AI Inventory"), href: "/systems" }, { label: t("Import from Excel") }]} description={t("Register many AI systems at once: download the standard template, fill one row per system (dropdowns prevent coding errors), upload, review the validation result and confirm.")} />
      <ImportForm />
    </>
  );
}
