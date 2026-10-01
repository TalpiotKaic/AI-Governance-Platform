import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { updateSystemAction } from "../../actions";
import { SystemForm } from "../../system-form";

export default async function EditSystemPage(props: PageProps<"/systems/[id]/edit">) {
  const user = await requireUser();
  const { id } = await props.params;
  const s = await db.aiSystem.findFirst({ where: { id, orgId: user.orgId }, include: { models: true, agentProfile: true } });
  if (!s) notFound();
  const m = s.models[0];
  return (
    <>
      <PageHeader title={`Edit ${s.code}`} crumbs={[{ label: "AI Inventory", href: "/systems" }, { label: s.code, href: `/systems/${s.id}` }, { label: "Edit" }]} />
      <SystemForm action={updateSystemAction.bind(null, s.id)} submitLabel="Save changes" initial={{ ...s, model: m ? { provider: m.provider, name: m.name, version: m.version } : null, agent: s.agentProfile ? { framework: s.agentProfile.framework, autonomyLevel: s.agentProfile.autonomyLevel, tools: s.agentProfile.tools as never, dataSources: s.agentProfile.dataSources as never, mcpServers: s.agentProfile.mcpServers as never, killSwitch: s.agentProfile.killSwitch, maxBudgetUsd: s.agentProfile.maxBudgetUsd } : null }} />
    </>
  );
}
