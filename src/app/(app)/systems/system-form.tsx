"use client";
import { useI18n } from "@/lib/i18n/client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Initial = Partial<{
  name: string; description: string | null; type: string; sector: string | null; purpose: string | null; deploymentContext: string | null; lifecycleStage: string; euAiActCategory: string; euAiActAnnexIIIArea: string | null; intendedUsers: string | null; affectedPersons: string | null; humanOversight: string | null; usesPersonalData: boolean; usesSensitiveData: boolean; customerFacing: boolean; automatedDecision: boolean; geographies: string[]; tags: string[];
  model: { provider: string; name: string; version: string | null } | null;
  agent: { framework: string | null; autonomyLevel: string; tools: { name: string; riskLevel?: string; allowed?: boolean; permissions?: string[] }[]; dataSources: { name: string }[]; mcpServers: { name: string }[]; killSwitch: boolean; maxBudgetUsd: number | null } | null;
}>;

export function SystemForm({ action, initial, submitLabel }: { action: (fd: FormData) => Promise<void>; initial?: Initial; submitLabel: string }) {
  const { t, L } = useI18n();
  const draftKey = `kveriai-system-draft-${initial?.name ?? "new"}`;
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState<Initial | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(draftKey);
      if (saved) setDraft(JSON.parse(saved));
    } catch(e) {}
    setLoaded(true);
  }, [draftKey]);

  const mergedInitial = draft ? { ...initial, ...draft } : initial;
  return <SystemFormInner key={loaded ? "loaded" : "initial"} action={action} initial={mergedInitial} submitLabel={submitLabel} draftKey={draftKey} t={t} L={L} />;
}

function SystemFormInner({ action, initial, submitLabel, draftKey, t, L }: { action: any; initial: any; submitLabel: string; draftKey: string; t: any; L: any }) {
  const [type, setType] = useState(initial?.type ?? "LLM_APPLICATION");
  const isAgent = type === "AGENT" || type === "MULTI_AGENT";
  const toolsText = initial?.agent?.tools?.map((t: any) => `${t.name}|${t.riskLevel ?? "medium"}|${t.allowed === false ? "false" : "true"}|${(t.permissions ?? []).join(",")}`).join("\n") ?? "search_knowledge_base|low|true|\nlookup_customer|medium|true|customer:read\nsend_email|high|true|email:send\nexport_customer_data|critical|false|data:export\ndelete_customer_record|critical|false|customer:delete";

  const handleSubmit = async (fd: FormData) => {
    try {
      await action(fd);
      sessionStorage.removeItem(draftKey);
    } catch (e) {
      console.error(e);
      alert(t("An error occurred. Please check your inputs."));
    }
  };

  return (
    <form 
      action={handleSubmit} 
      className="space-y-6" 
      onKeyDown={(e) => { if (e.key === "Enter" && e.target instanceof HTMLInputElement) e.preventDefault(); }}
      onChange={(e) => {
        const fd = new FormData(e.currentTarget);
        const data = Object.fromEntries(fd.entries());
        // Reconstruct draft object
        const draftObj: any = { ...data };
        draftObj.usesPersonalData = data.usesPersonalData === "on";
        draftObj.usesSensitiveData = data.usesSensitiveData === "on";
        draftObj.customerFacing = data.customerFacing === "on";
        draftObj.automatedDecision = data.automatedDecision === "on";
        draftObj.geographies = data.geographies ? String(data.geographies).split(",").map(s => s.trim()) : [];
        draftObj.tags = data.tags ? String(data.tags).split(",").map(s => s.trim()) : [];
        draftObj.model = { provider: data.modelProvider, name: data.modelName, version: data.modelVersion };
        if (data.agentFramework || toolsText) {
          // toolsText is derived from the Textarea which is managed by the form, but wait...
          // If we just store the flat form data in the draft, it won't map perfectly.
          // BUT wait, we can just use the flat FormData if we map it correctly!
          draftObj.agent = { 
            framework: data.agentFramework, 
            autonomyLevel: data.autonomyLevel, 
            tools: data.tools ? String(data.tools).split("\n").map(line => {
              const [name, riskLevel = "medium", allowed = "true", perms = ""] = line.split("|");
              return { name, riskLevel, allowed: allowed !== "false", permissions: perms.split(",") };
            }) : [],
            dataSources: data.dataSources ? String(data.dataSources).split("\n").map(name => ({ name })) : [],
            mcpServers: data.mcpServers ? String(data.mcpServers).split("\n").map(name => ({ name })) : [],
            killSwitch: data.killSwitch === "on", 
            maxBudgetUsd: data.maxBudgetUsd ? Number(data.maxBudgetUsd) : null 
          };
        }
        sessionStorage.setItem(draftKey, JSON.stringify(draftObj));
      }}
    >
      <Card>
        <CardHeader><CardTitle>{t("1. Identity & context (intake)")}</CardTitle><CardDescription>{t("Intake answers drive automatic risk tiering, EU AI Act classification prompts and the approval workflow.")}</CardDescription></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={t("System name")}><Input name="name" required defaultValue={initial?.name ?? ""} placeholder={t("e.g. Customer Service Agent")} /></Field>
          <Field label={t("System type")}>
            <Select name="type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="PREDICTIVE_ML">{t("Predictive ML model")}</option><option value="LLM_APPLICATION">{t("LLM application")}</option><option value="RAG_ASSISTANT">{t("RAG assistant")}</option><option value="AGENT">{t("AI agent (tools)")}</option><option value="MULTI_AGENT">{t("Multi-agent system")}</option><option value="EXTERNAL_SAAS">{t("External SaaS AI")}</option>
            </Select>
          </Field>
          <Field label={t("Sector")}><Input name="sector" defaultValue={initial?.sector ?? ""} placeholder={t("Financial services, Healthcare, Manufacturing…")} /></Field>
          <Field label={t("Lifecycle stage")}>
            <Select name="lifecycleStage" defaultValue={initial?.lifecycleStage ?? "DEVELOPMENT"}>
              {["PLANNED", "DEVELOPMENT", "TESTING", "APPROVED", "PRODUCTION", "RETIRED"].map((s) => <option key={s} value={s}>{L(s)}</option>)}
            </Select>
          </Field>
          <Field label={t("Purpose / intended use")} className="md:col-span-2"><Textarea name="purpose" defaultValue={initial?.purpose ?? ""} /></Field>
          <Field label={t("Description")} className="md:col-span-2"><Textarea name="description" defaultValue={initial?.description ?? ""} /></Field>
          <Field label={t("Deployment context")}><Input name="deploymentContext" defaultValue={initial?.deploymentContext ?? ""} placeholder={t("Customer portal, internal tool, embedded…")} /></Field>
          <Field label={t("Geographies (comma-separated)")}><Input name="geographies" defaultValue={initial?.geographies?.join(", ") ?? "KR"} /></Field>
          <Field label={t("Intended users")}><Input name="intendedUsers" defaultValue={initial?.intendedUsers ?? ""} /></Field>
          <Field label={t("Affected persons")}><Input name="affectedPersons" defaultValue={initial?.affectedPersons ?? ""} /></Field>
          <Field label={t("Tags (comma-separated)")} className="md:col-span-2"><Input name="tags" defaultValue={initial?.tags?.join(", ") ?? ""} /></Field>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>{t("2. Regulatory classification & data")}</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={t("EU AI Act category")} hint={t("Annex III areas: biometrics, critical infrastructure, education, employment, essential services (credit, insurance), law enforcement, migration, justice.")}>
            <Select name="euAiActCategory" defaultValue={initial?.euAiActCategory ?? "UNCLASSIFIED"}>
              <option value="UNCLASSIFIED">{t("Unclassified")}</option><option value="MINIMAL">{t("Minimal risk")}</option><option value="LIMITED_TRANSPARENCY">{t("Limited risk (Art. 50 transparency)")}</option><option value="HIGH_RISK">{t("High-risk (Annex I / III)")}</option><option value="PROHIBITED">{t("Prohibited practice (Art. 5)")}</option><option value="GPAI">{t("GPAI model")}</option><option value="GPAI_SYSTEMIC">{t("GPAI with systemic risk")}</option>
            </Select>
          </Field>
          <Field label={t("Annex III area (if high-risk)")}><Input name="euAiActAnnexIIIArea" defaultValue={initial?.euAiActAnnexIIIArea ?? ""} placeholder={t("e.g. Annex III §5(b) creditworthiness")} /></Field>
          <Field label={t("Human oversight measures")} className="md:col-span-2"><Textarea name="humanOversight" defaultValue={initial?.humanOversight ?? ""} placeholder={t("Approval gates, review of outputs, kill switch, escalation…")} /></Field>
          <div className="grid grid-cols-1 gap-2 md:col-span-2 md:grid-cols-2">
            <Checkbox name="usesPersonalData" label={t("Processes personal data")} defaultChecked={initial?.usesPersonalData} />
            <Checkbox name="usesSensitiveData" label={t("Processes special-category / sensitive data")} defaultChecked={initial?.usesSensitiveData} />
            <Checkbox name="customerFacing" label={t("Interacts directly with natural persons (customer-facing)")} defaultChecked={initial?.customerFacing} />
            <Checkbox name="automatedDecision" label={t("Makes or materially informs automated decisions about people")} defaultChecked={initial?.automatedDecision} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>{t("3. Model")}</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label={t("Provider")}><Input name="modelProvider" defaultValue={initial?.model?.provider ?? ""} placeholder={t("Anthropic, OpenAI, in-house…")} /></Field>
          <Field label={t("Model name")}><Input name="modelName" defaultValue={initial?.model?.name ?? ""} placeholder={t("claude-sonnet, gpt-4o, GBM v7…")} /></Field>
          <Field label={t("Version")}><Input name="modelVersion" defaultValue={initial?.model?.version ?? ""} /></Field>
        </CardContent>
      </Card>
      {isAgent && (
        <Card>
          <CardHeader><CardTitle>{t("4. Agent profile (Agent Card)")}</CardTitle><CardDescription>{t("Tools, data sources and MCP servers define the agent&apos;s action surface; the allow-list is enforced during evaluation and drives agent-specific risks.")}</CardDescription></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label={t("Agent framework")}><Input name="agentFramework" defaultValue={initial?.agent?.framework ?? ""} placeholder={t("LangGraph, CrewAI, AutoGen, custom…")} /></Field>
            <Field label={t("Autonomy level")}>
              <Select name="autonomyLevel" defaultValue={initial?.agent?.autonomyLevel ?? "SUPERVISED"}><option value="ASSISTIVE">{t("Assistive — suggests, human executes")}</option><option value="SUPERVISED">{t("Supervised — approval on sensitive actions")}</option><option value="AUTONOMOUS">{t("Autonomous — executes end-to-end")}</option></Select>
            </Field>
            <Field label={t("Tools (one per line: name|riskLevel|allowed|permissions)")} className="md:col-span-2" hint={t("Sandbox tool names are evaluated against the built-in tool catalogue (search_knowledge_base, lookup_customer, get_account_balance, transfer_funds, send_email, export_customer_data, delete_customer_record, run_sql, read_patient_record, schedule_appointment, process_refund, escalate_to_human, book_flight, fetch_url).")}>
              <Textarea name="tools" className="min-h-[140px] font-mono text-xs" defaultValue={toolsText} />
            </Field>
            <Field label={t("Data sources (one per line)")}><Textarea name="dataSources" defaultValue={initial?.agent?.dataSources?.map((d: any) => d.name).join("\n") ?? ""} /></Field>
            <Field label={t("MCP servers (one per line)")}><Textarea name="mcpServers" defaultValue={initial?.agent?.mcpServers?.map((d: any) => d.name).join("\n") ?? ""} /></Field>
            <Checkbox name="killSwitch" label={t("Kill switch / emergency stop implemented")} defaultChecked={initial?.agent?.killSwitch} />
            <Field label={t("Budget cap (USD per session)")}><Input name="maxBudgetUsd" type="number" step="0.01" defaultValue={initial?.agent?.maxBudgetUsd ?? ""} /></Field>
          </CardContent>
        </Card>
      )}
      <div className="flex justify-end gap-2"><Button type="submit">{submitLabel}</Button></div>
    </form>
  );
}
