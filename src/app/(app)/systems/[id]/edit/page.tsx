import { notFound } from "next/navigation";
import { requirePagePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { updateSystemAction } from "../../actions";
import { SystemForm } from "../../system-form";

export default async function EditSystemPage(props: PageProps<"/systems/[id]/edit">) {
  const user = await requirePagePermission("systems.write");
  const { id } = await props.params;
  const s = await db.aiSystem.findFirst({ where: { id, orgId: user.orgId }, include: { models: true, agentProfile: true, vendors: true, datasets: true } });
  const [vendors, datasets] = await Promise.all([db.vendor.findMany({ where: { orgId: user.orgId }, orderBy: { name: "asc" }, select: { id: true, name: true, serviceType: true, country: true, riskScore: true } }), db.dataset.findMany({ where: { orgId: user.orgId }, orderBy: { name: "asc" }, select: { id: true, name: true, containsPii: true, sensitivity: true } })]);
  if (!s) notFound();
  const m = s.models[0];
  return (
    <>
      <PageHeader title={`Edit ${s.code}`} crumbs={[{ label: "AI Inventory", href: "/systems" }, { label: s.code, href: `/systems/${s.id}` }, { label: "Edit" }]} />
      <SystemForm action={updateSystemAction.bind(null, s.id)} submitLabel="Save changes" catalog={{ vendors, datasets, initialLinks: { vendors: s.vendors.map((v) => ({ id: v.vendorId, role: v.role })), datasets: s.datasets.map((d) => ({ id: d.datasetId, purpose: d.purpose })) } }} initial={{ ...s, model: m ? { provider: m.provider, name: m.name, version: m.version } : null, agent: s.agentProfile ? { framework: s.agentProfile.framework, autonomyLevel: s.agentProfile.autonomyLevel, tools: s.agentProfile.tools as never, dataSources: s.agentProfile.dataSources as never, mcpServers: s.agentProfile.mcpServers as never, killSwitch: s.agentProfile.killSwitch, maxBudgetUsd: s.agentProfile.maxBudgetUsd } : null }} />
    </>
  );
}
