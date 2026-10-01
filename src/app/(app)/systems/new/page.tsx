import { PageHeader } from "@/components/ui/page-header";
import { createSystemAction } from "../actions";
import { SystemForm } from "../system-form";

export const metadata = { title: "Register AI system" };

export default function NewSystemPage() {
  return (
    <>
      <PageHeader title="Register AI system" crumbs={[{ label: "AI Inventory", href: "/systems" }, { label: "New" }]} description="Intake assessment. Your answers set the initial risk tier, seed context-specific risks and create the review/approval workflow." />
      <SystemForm action={createSystemAction} submitLabel="Register system" />
    </>
  );
}
