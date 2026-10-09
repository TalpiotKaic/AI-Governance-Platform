import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui/page-header";
import { ImportScenariosForm } from "./import-form";

export const metadata = { title: "Import scenarios" };

export default async function ImportScenariosPage() {
  const { t } = await getI18n();
  const user = await requirePagePermission("plans.write");
  const systems = await db.aiSystem.findMany({ where: { orgId: user.orgId }, orderBy: { code: "asc" }, select: { id: true, code: true, name: true } });
  return (
    <>
      <PageHeader title={t("Import scenarios (JSONL)")} crumbs={[{ label: t("Test Library"), href: "/library" }, { label: t("Import scenarios (JSONL)") }]} description={t("Load an evaluation dataset produced by the Evaluation-Dataset-Generator (risk track) as organisation-specific test scenarios. Records are grouped by risk axis and domain, each prompt keeps its MUST / MUST NOT rubric for the judge, and the file is registered in the dataset register as an evaluation dataset.")} />
      <ImportScenariosForm systems={systems} />
    </>
  );
}
