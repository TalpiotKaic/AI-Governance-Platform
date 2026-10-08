import { PageHeader } from "@/components/ui/page-header";
import { createSystemAction } from "../actions";
import { SystemForm } from "../system-form";
import { getI18n } from "@/lib/i18n/server";
import { requirePagePermission } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "Register AI system" };

export default async function NewSystemPage() {
  const user = await requirePagePermission("systems.write");
  const { t } = await getI18n();
  const [vendors, datasets] = await Promise.all([db.vendor.findMany({ where: { orgId: user.orgId }, orderBy: { name: "asc" }, select: { id: true, name: true, serviceType: true, country: true, riskScore: true } }), db.dataset.findMany({ where: { orgId: user.orgId }, orderBy: { name: "asc" }, select: { id: true, name: true, containsPii: true, sensitivity: true } })]);
  return (
    <>
      <PageHeader title={t("Register AI system")} crumbs={[{ label: "AI Inventory", href: "/systems" }, { label: "New" }]} description={t("Intake assessment. Your answers set the initial risk tier, seed context-specific risks and create the review/approval workflow.")} />
      <SystemForm action={createSystemAction} submitLabel={t("Register system")} catalog={{ vendors, datasets }} />
    </>
  );
}
