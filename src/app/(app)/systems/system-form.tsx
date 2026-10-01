"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Initial = Partial<{
  name: string; description: string | null; type: string; sector: string | null; purpose: string | null; deploymentContext: string | null; lifecycleStage: string; euAiActCategory: string; euAiActAnnexIIIArea: string | null; intendedUsers: string | null; affectedPersons: string | null; humanOversight: string | null; usesPersonalData: boolean; usesSensitiveData: boolean; customerFacing: boolean; automatedDecision: boolean; geographies: string[]; tags: string[];
  model: { provider: string; name: string; version: string | null } | null;
  agent: { framework: string | null; autonomyLevel: string; tools: { name: string; riskLevel?: string; allowed?: boolean; permissions?: string[] }[]; dataSources: { name: string }[]; mcpServers: { name: string }[]; killSwitch: boolean; maxBudgetUsd: number | null } | null;
}>;

export function SystemForm({ action, initial, submitLabel }: { action: (fd: FormData) => Promise<void>; initial?: Initial; submitLabel: string }) {
  const [type, setType] = useState(initial?.type ?? "LLM_APPLICATION");
  const isAgent = type === "AGENT" || type === "MULTI_AGENT";
  const toolsText = initial?.agent?.tools?.map((t) => `${t.name}|${t.riskLevel ?? "medium"}|${t.allowed === false ? "false" : "true"}|${(t.permissions ?? []).join(",")}`).join("\n") ?? "search_knowledge_base|low|true|\nlookup_customer|medium|true|customer:read\nsend_email|high|true|email:send\nexport_customer_data|critical|false|data:export\ndelete_customer_record|critical|false|customer:delete";
  return (
    <form action={action} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>1. Identity & context (intake)</CardTitle><CardDescription>Intake answers drive automatic risk tiering, EU AI Act classification prompts and the approval workflow.</CardDescription></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="System name"><Input name="name" required defaultValue={initial?.name ?? ""} placeholder="e.g. Customer Service Agent" /></Field>
          <Field label="System type">
            <Select name="type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="PREDICTIVE_ML">Predictive ML model</option><option value="LLM_APPLICATION">LLM application</option><option value="RAG_ASSISTANT">RAG assistant</option><option value="AGENT">AI agent (tools)</option><option value="MULTI_AGENT">Multi-agent system</option><option value="EXTERNAL_SAAS">External SaaS AI</option>
            </Select>
          </Field>
          <Field label="Sector"><Input name="sector" defaultValue={initial?.sector ?? ""} placeholder="Financial services, Healthcare, Manufacturing…" /></Field>
          <Field label="Lifecycle stage">
            <Select name="lifecycleStage" defaultValue={initial?.lifecycleStage ?? "DEVELOPMENT"}>
              {["PLANNED", "DEVELOPMENT", "TESTING", "APPROVED", "PRODUCTION", "RETIRED"].map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
            </Select>
          </Field>
          <Field label="Purpose / intended use" className="md:col-span-2"><Textarea name="purpose" defaultValue={initial?.purpose ?? ""} /></Field>
          <Field label="Description" className="md:col-span-2"><Textarea name="description" defaultValue={initial?.description ?? ""} /></Field>
          <Field label="Deployment context"><Input name="deploymentContext" defaultValue={initial?.deploymentContext ?? ""} placeholder="Customer portal, internal tool, embedded…" /></Field>
          <Field label="Geographies (comma-separated)"><Input name="geographies" defaultValue={initial?.geographies?.join(", ") ?? "KR"} /></Field>
          <Field label="Intended users"><Input name="intendedUsers" defaultValue={initial?.intendedUsers ?? ""} /></Field>
          <Field label="Affected persons"><Input name="affectedPersons" defaultValue={initial?.affectedPersons ?? ""} /></Field>
          <Field label="Tags (comma-separated)" className="md:col-span-2"><Input name="tags" defaultValue={initial?.tags?.join(", ") ?? ""} /></Field>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>2. Regulatory classification & data</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="EU AI Act category" hint="Annex III areas: biometrics, critical infrastructure, education, employment, essential services (credit, insurance), law enforcement, migration, justice.">
            <Select name="euAiActCategory" defaultValue={initial?.euAiActCategory ?? "UNCLASSIFIED"}>
              <option value="UNCLASSIFIED">Unclassified</option><option value="MINIMAL">Minimal risk</option><option value="LIMITED_TRANSPARENCY">Limited risk (Art. 50 transparency)</option><option value="HIGH_RISK">High-risk (Annex I / III)</option><option value="PROHIBITED">Prohibited practice (Art. 5)</option><option value="GPAI">GPAI model</option><option value="GPAI_SYSTEMIC">GPAI with systemic risk</option>
            </Select>
          </Field>
          <Field label="Annex III area (if high-risk)"><Input name="euAiActAnnexIIIArea" defaultValue={initial?.euAiActAnnexIIIArea ?? ""} placeholder="e.g. Annex III §5(b) creditworthiness" /></Field>
          <Field label="Human oversight measures" className="md:col-span-2"><Textarea name="humanOversight" defaultValue={initial?.humanOversight ?? ""} placeholder="Approval gates, review of outputs, kill switch, escalation…" /></Field>
          <div className="grid grid-cols-1 gap-2 md:col-span-2 md:grid-cols-2">
            <Checkbox name="usesPersonalData" label="Processes personal data" defaultChecked={initial?.usesPersonalData} />
            <Checkbox name="usesSensitiveData" label="Processes special-category / sensitive data" defaultChecked={initial?.usesSensitiveData} />
            <Checkbox name="customerFacing" label="Interacts directly with natural persons (customer-facing)" defaultChecked={initial?.customerFacing} />
            <Checkbox name="automatedDecision" label="Makes or materially informs automated decisions about people" defaultChecked={initial?.automatedDecision} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>3. Model</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Provider"><Input name="modelProvider" defaultValue={initial?.model?.provider ?? ""} placeholder="Anthropic, OpenAI, in-house…" /></Field>
          <Field label="Model name"><Input name="modelName" defaultValue={initial?.model?.name ?? ""} placeholder="claude-sonnet, gpt-4o, GBM v7…" /></Field>
          <Field label="Version"><Input name="modelVersion" defaultValue={initial?.model?.version ?? ""} /></Field>
        </CardContent>
      </Card>
      {isAgent && (
        <Card>
          <CardHeader><CardTitle>4. Agent profile (Agent Card)</CardTitle><CardDescription>Tools, data sources and MCP servers define the agent&apos;s action surface; the allow-list is enforced during evaluation and drives agent-specific risks.</CardDescription></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Agent framework"><Input name="agentFramework" defaultValue={initial?.agent?.framework ?? ""} placeholder="LangGraph, CrewAI, AutoGen, custom…" /></Field>
            <Field label="Autonomy level">
              <Select name="autonomyLevel" defaultValue={initial?.agent?.autonomyLevel ?? "SUPERVISED"}><option value="ASSISTIVE">Assistive — suggests, human executes</option><option value="SUPERVISED">Supervised — approval on sensitive actions</option><option value="AUTONOMOUS">Autonomous — executes end-to-end</option></Select>
            </Field>
            <Field label="Tools (one per line: name|riskLevel|allowed|permissions)" className="md:col-span-2" hint="Sandbox tool names are evaluated against the built-in tool catalogue (search_knowledge_base, lookup_customer, get_account_balance, transfer_funds, send_email, export_customer_data, delete_customer_record, run_sql, read_patient_record, schedule_appointment, process_refund, escalate_to_human, book_flight, fetch_url).">
              <Textarea name="tools" className="min-h-[140px] font-mono text-xs" defaultValue={toolsText} />
            </Field>
            <Field label="Data sources (one per line)"><Textarea name="dataSources" defaultValue={initial?.agent?.dataSources?.map((d) => d.name).join("\n") ?? ""} /></Field>
            <Field label="MCP servers (one per line)"><Textarea name="mcpServers" defaultValue={initial?.agent?.mcpServers?.map((d) => d.name).join("\n") ?? ""} /></Field>
            <Checkbox name="killSwitch" label="Kill switch / emergency stop implemented" defaultChecked={initial?.agent?.killSwitch} />
            <Field label="Budget cap (USD per session)"><Input name="maxBudgetUsd" type="number" step="0.01" defaultValue={initial?.agent?.maxBudgetUsd ?? ""} /></Field>
          </CardContent>
        </Card>
      )}
      <div className="flex justify-end gap-2"><Button type="submit">{submitLabel}</Button></div>
    </form>
  );
}
