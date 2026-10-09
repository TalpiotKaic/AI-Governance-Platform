import { requirePagePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { createRunAction } from "../actions";
import { RunForm } from "./run-form";
import { getI18n } from "@/lib/i18n/server";
import { localizeScenario } from "@/lib/i18n/library";

export default async function NewRunPage(props: PageProps<"/evaluations/new">) {
  const { locale, t } = await getI18n();
  const user = await requirePagePermission("evaluations.run");
  const sp = await props.searchParams;
  const systems = await db.aiSystem.findMany({ where: { orgId: user.orgId }, orderBy: { code: "asc" }, include: { plans: { orderBy: { createdAt: "desc" } } } });
  const scenarios = (await db.testScenario.findMany({ orderBy: { code: "asc" }, include: { method: true } })).map((s) => localizeScenario(locale, s));
  const credentials = await db.providerCredential.findMany({ where: { orgId: user.orgId } });
  const hasEnvKeys = { anthropic: Boolean(process.env.ANTHROPIC_API_KEY), openai: Boolean(process.env.OPENAI_API_KEY), ollama: Boolean(process.env.OLLAMA_BASE_URL) };
  return (
    <>
      <PageHeader title={t("New evaluation run")} crumbs={[{ label: "Evaluation Runs", href: "/evaluations" }, { label: "New" }]} description={t("Choose the system, scenarios (or a plan), and the target. DEMO mode runs against a deterministic simulated target so the full pipeline can be exercised without API keys; LIVE mode calls the real model/agent and uses an LLM-as-judge.")} />
      <RunForm action={createRunAction} systems={systems.map((s) => ({ id: s.id, code: s.code, name: s.name, type: s.type, plans: s.plans.map((p) => ({ id: p.id, name: p.name })) }))} scenarios={scenarios.map((s) => ({ id: s.id, code: s.code, name: s.name, category: s.method.category, testingType: s.method.testingType, applicableTo: s.applicableTo, prompts: (s.prompts as unknown[]).length }))} credentials={credentials.map((c) => ({ provider: c.provider, label: c.label, defaultModel: c.defaultModel }))} hasEnvKeys={hasEnvKeys} initialSystemId={typeof sp.systemId === "string" ? sp.systemId : undefined} initialPlanId={typeof sp.planId === "string" ? sp.planId : undefined} />
    </>
  );
}
