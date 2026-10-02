import { PageHeader } from "@/components/ui/page-header";
import { createSystemAction } from "../actions";
import { SystemForm } from "../system-form";
import { getI18n } from "@/lib/i18n/server";

export const metadata = { title: "Register AI system" };

export default async function NewSystemPage() {
  const { t } = await getI18n();
  return (
    <>
      <PageHeader title={t("Register AI system")} crumbs={[{ label: "AI Inventory", href: "/systems" }, { label: "New" }]} description={t("Intake assessment. Your answers set the initial risk tier, seed context-specific risks and create the review/approval workflow.")} />
      <SystemForm action={createSystemAction} submitLabel={t("Register system")} />
    </>
  );
}
