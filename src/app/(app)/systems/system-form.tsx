"use client";
import { useI18n } from "@/lib/i18n/client";
import { useState, useEffect, useRef } from "react";
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
      const saved = localStorage.getItem(draftKey);
      if (saved) setDraft(JSON.parse(saved));
    } catch(e) {}
    setLoaded(true);
  }, [draftKey]);

  const mergedInitial = draft ? { ...initial, ...draft } : initial;
  return (
    <div className="flex flex-col gap-4">
      {draft && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md">
          <p className="font-bold">System Debug: Draft Restored!</p>
          <p className="text-sm">We successfully found a saved draft in your browser. If the form below is empty, it means your browser prevented the form from showing the data.</p>
        </div>
      )}
      <SystemFormInner key={loaded ? "loaded" : "initial"} action={action} initial={mergedInitial} submitLabel={submitLabel} draftKey={draftKey} t={t} L={L} />
    </div>
  );
}

function SystemFormInner({ action, initial, submitLabel, draftKey, t, L }: { action: any; initial: any; submitLabel: string; draftKey: string; t: any; L: any }) {
  const [type, setType] = useState(initial?.type ?? "LLM_APPLICATION");
  const isAgent = type === "AGENT" || type === "MULTI_AGENT";
  const toolsText = initial?.agent?.tools?.map((t: any) => `${t.name}|${t.riskLevel ?? "medium"}|${t.allowed === false ? "false" : "true"}|${(t.permissions ?? []).join(",")}`).join("\n") ?? "search_knowledge_base|low|true|\nlookup_customer|medium|true|customer:read\nsend_email|high|true|email:send\nexport_customer_data|critical|false|data:export\ndelete_customer_record|critical|false|customer:delete";

  const formRef = useRef<HTMLFormElement>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    setLastSaved(new Date());
  }, []);

  useEffect(() => {
    try {
      // FORCE RESTORE TO DOM (Bypass React bugs)
      if (formRef.current && initial) {
        const form = formRef.current;
        const setVal = (name: string, val: any) => {
          if (!val) return;
          const el = form.elements.namedItem(name);
          if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
            if (el.type === "checkbox") {
              (el as HTMLInputElement).checked = val === true || val === "on";
            } else {
              el.value = val;
            }
          }
        };
        setVal("name", initial.name);
        setVal("type", initial.type);
        setVal("sector", initial.sector);
        setVal("purpose", initial.purpose);
        setVal("deploymentContext", initial.deploymentContext);
        setVal("lifecycleStage", initial.lifecycleStage);
        setVal("euAiActCategory", initial.euAiActCategory);
        setVal("euAiActAnnexIIIArea", initial.euAiActAnnexIIIArea);
        setVal("intendedUsers", initial.intendedUsers);
        setVal("affectedPersons", initial.affectedPersons);
        setVal("humanOversight", initial.humanOversight);
        setVal("usesPersonalData", initial.usesPersonalData);
        setVal("usesSensitiveData", initial.usesSensitiveData);
        setVal("customerFacing", initial.customerFacing);
        setVal("automatedDecision", initial.automatedDecision);
        setVal("geographies", initial.geographies?.join(", "));
        setVal("tags", initial.tags?.join(", "));
        setVal("modelProvider", initial.model?.provider);
        setVal("modelName", initial.model?.name);
        setVal("modelVersion", initial.model?.version);
        setVal("agentFramework", initial.agent?.framework);
        setVal("autonomyLevel", initial.agent?.autonomyLevel);
        setVal("tools", toolsText);
        setVal("dataSources", initial.agent?.dataSources?.map((d: any) => d.name).join("\n"));
        setVal("mcpServers", initial.agent?.mcpServers?.map((m: any) => m.name).join("\n"));
        setVal("killSwitch", initial.agent?.killSwitch);
        setVal("maxBudgetUsd", initial.agent?.maxBudgetUsd);
      }
    } catch (e: any) {
      console.error("DOM Restore Error:", e);
      const debugEl = document.getElementById("debug-live-state");
      if (debugEl) debugEl.innerText = "DOM RESTORE CRASHED: " + String(e);
    }
    
    // PREVENT ACCIDENTAL REFRESH/NAVIGATION
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [draftKey, toolsText, initial]);

  const saveDraft = () => {
    try {
      if (!formRef.current) return;
      const fd = new FormData(formRef.current);
      const data = Object.fromEntries(fd.entries());
      const draftObj: any = { ...data };
      draftObj.usesPersonalData = data.usesPersonalData === "on";
      draftObj.usesSensitiveData = data.usesSensitiveData === "on";
      draftObj.customerFacing = data.customerFacing === "on";
      draftObj.automatedDecision = data.automatedDecision === "on";
      draftObj.geographies = data.geographies ? String(data.geographies).split(",").map(s => s.trim()) : [];
      draftObj.tags = data.tags ? String(data.tags).split(",").map(s => s.trim()) : [];
      draftObj.model = { provider: data.modelProvider, name: data.modelName, version: data.modelVersion };
      if (data.agentFramework || toolsText) {
        draftObj.agent = { 
          framework: data.agentFramework,
          autonomyLevel: data.autonomyLevel,
          tools: data.tools ? String(data.tools).split("\n").map(line => {
            const [name, riskLevel = "medium", allowed = "true", perms = ""] = line.split("|");
            return { name, riskLevel, allowed: allowed !== "false", permissions: perms.split(",") };
          }) : [],
          dataSources: data.dataSources ? String(data.dataSources).split("\n").map(n => ({ name: n })) : [],
          mcpServers: data.mcpServers ? String(data.mcpServers).split("\n").map(n => ({ name: n })) : [],
          killSwitch: data.killSwitch === "on",
          maxBudgetUsd: data.maxBudgetUsd ? Number(data.maxBudgetUsd) : null 
        };
      }
      const newSaved = JSON.stringify(draftObj);
      
      const debugEl = document.getElementById("debug-live-state");
      if (debugEl) debugEl.innerText = "Event saved:\n" + newSaved;

      if (localStorage.getItem(draftKey) !== newSaved) {
        localStorage.setItem(draftKey, newSaved);
        setLastSaved(new Date());
      }
    } catch (err: any) {
      console.error("Auto-save failed", err);
      const debugEl = document.getElementById("debug-live-state");
      if (debugEl) debugEl.innerText = "ERROR SAVING TO LOCALSTORAGE: " + String(err);
    }
  };

  const handleSubmit = async (fd: FormData) => {
    try {
      await action(fd);
      localStorage.removeItem(draftKey);
    } catch (e: any) {
      if (e?.digest?.startsWith("NEXT_REDIRECT")) {
        localStorage.removeItem(draftKey);
        throw e;
      }
      console.error(e);
      alert(t("An error occurred. Please check your inputs."));
    }
  };

  return (
    <form 
      ref={formRef}
      onChange={saveDraft}
      onKeyUp={saveDraft}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        handleSubmit(fd);
      }}
      className="space-y-6" 
      onKeyDown={(e) => { if (e.key === "Enter" && e.target instanceof HTMLInputElement) e.preventDefault(); }}
    >
      <div className="flex justify-end h-4">
        {lastSaved && <span style={{ color: "#16a34a", fontWeight: "bold" }} className="text-xs">{t("Draft auto-saved:")} {lastSaved.toLocaleTimeString()}</span>}
      </div>
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
          <div className="flex flex-col">
            <div className="flex items-center gap-1 mb-1">
              <label className="block text-xs font-medium text-muted">{t("EU AI Act category")}</label>
              <button type="button" onClick={() => {
                const el = document.getElementById('eu-ai-act-help');
                if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
              }} className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400" title={t("Show help")}>?</button>
            </div>
            <Select name="euAiActCategory" defaultValue={initial?.euAiActCategory ?? "UNCLASSIFIED"}>
              <option value="UNCLASSIFIED">{t("Unclassified")}</option><option value="MINIMAL">{t("Minimal risk")}</option><option value="LIMITED_TRANSPARENCY">{t("Limited risk (Art. 50 transparency)")}</option><option value="HIGH_RISK">{t("High-risk (Annex I / III)")}</option><option value="PROHIBITED">{t("Prohibited practice (Art. 5)")}</option><option value="GPAI">{t("GPAI model")}</option><option value="GPAI_SYSTEMIC">{t("GPAI with systemic risk")}</option>
            </Select>
            <p className="mt-1 text-[11px] text-muted">{t("Annex III areas: biometrics, critical infrastructure, education, employment, essential services (credit, insurance), law enforcement, migration, justice.")}</p>
            <div id="eu-ai-act-help" style={{ display: 'none' }} className="mt-2 text-[11px] bg-blue-50 border border-blue-100 p-3 rounded text-blue-800 shadow-sm relative z-10">
              <ul className="space-y-1.5 list-disc pl-4">
                <li><strong>{t("Unclassified")}</strong>: {t("Not yet classified.")}</li>
                <li><strong>{t("Minimal risk")}</strong>: {t("Most AI systems (e.g. spam filters). Unregulated.")}</li>
                <li><strong>{t("Limited risk (Art. 50 transparency)")}</strong>: {t("Systems interacting with humans (e.g. chatbots, deepfakes). Requires transparency.")}</li>
                <li><strong>{t("High-risk (Annex I / III)")}</strong>: {t("Systems in biometrics, critical infrastructure, education, employment, essential services, law enforcement. Strict compliance required.")}</li>
                <li><strong>{t("Prohibited practice (Art. 5)")}</strong>: {t("Subliminal manipulation, social scoring, untargeted facial scraping. Banned.")}</li>
                <li><strong>{t("GPAI model")}</strong>: {t("General Purpose AI models capable of wide range of tasks.")}</li>
                <li><strong>{t("GPAI with systemic risk")}</strong>: {t("High-impact GPAI models trained with massive compute.")}</li>
              </ul>
            </div>
          </div>
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

      <div className="bg-gray-100 p-4 rounded text-xs font-mono overflow-auto max-h-40">
        <p className="font-bold mb-2">Live Data Capture Status:</p>
        <p>If this stays empty when you type, your typing is not being captured!</p>
        <p id="debug-live-state" className="text-blue-600 mt-2 break-all">Waiting for input...</p>
      </div>

      <div className="flex justify-end gap-2"><Button type="submit">{submitLabel}</Button></div>
    </form>
  );
}
