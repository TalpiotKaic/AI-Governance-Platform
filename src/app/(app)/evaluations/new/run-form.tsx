"use client";
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { enumLabel } from "@/lib/utils";

type Sys = { id: string; code: string; name: string; type: string; plans: { id: string; name: string }[] };
type Sc = { id: string; code: string; name: string; category: string; testingType: string; applicableTo: string[]; prompts: number };

export function RunForm({ action, systems, scenarios, credentials, hasEnvKeys, initialSystemId, initialPlanId }: { action: (fd: FormData) => Promise<void>; systems: Sys[]; scenarios: Sc[]; credentials: { provider: string; label: string; defaultModel: string | null }[]; hasEnvKeys: { anthropic: boolean; openai: boolean; ollama: boolean }; initialSystemId?: string; initialPlanId?: string }) {
  const [systemId, setSystemId] = useState(initialSystemId ?? systems[0]?.id ?? "");
  const [planId, setPlanId] = useState(initialPlanId ?? "");
  const [mode, setMode] = useState<"DEMO" | "LIVE">("DEMO");
  const [adapter, setAdapter] = useState("anthropic");
  const sys = systems.find((s) => s.id === systemId);
  const applicable = useMemo(() => scenarios.filter((s) => !sys || s.applicableTo.includes(sys.type)), [scenarios, sys]);
  const liveAvailable = credentials.length > 0 || hasEnvKeys.anthropic || hasEnvKeys.openai || hasEnvKeys.ollama;
  return (
    <form action={action} className="space-y-4">
      <Card><CardHeader><CardTitle>1. Target system & scope</CardTitle></CardHeader><CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="AI system"><Select name="systemId" value={systemId} onChange={(e) => { setSystemId(e.target.value); setPlanId(""); }}>{systems.map((s) => <option key={s.id} value={s.id}>{s.code} · {s.name} ({enumLabel(s.type)})</option>)}</Select></Field>
        <Field label="Run name"><Input name="name" defaultValue={sys ? `${sys.name} evaluation` : ""} /></Field>
        <Field label="Evaluation plan (optional)" hint="If a plan is selected, its scenarios are used and the ad-hoc selection below is ignored."><Select name="planId" value={planId} onChange={(e) => setPlanId(e.target.value)}><option value="">— ad hoc scenario selection —</option>{sys?.plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></Field>
        <div className="grid grid-cols-3 gap-2"><Field label="Model version (env)"><Input name="envModelVersion" placeholder="e.g. v5.5" /></Field><Field label="Prompt version"><Input name="envPromptVersion" placeholder="v14" /></Field><Field label="Notes"><Input name="envNotes" /></Field></div>
      </CardContent></Card>
      {!planId && (
        <Card><CardHeader><CardTitle>2. Scenarios</CardTitle><CardDescription>{applicable.length} scenarios applicable to {sys ? enumLabel(sys.type) : "this system"}.</CardDescription></CardHeader><CardContent>
          <div className="grid grid-cols-1 gap-1 md:grid-cols-2">{applicable.map((s) => <label key={s.id} className="flex items-start gap-2 rounded-md border border-border px-2 py-1.5 text-sm"><input type="checkbox" name="scenarioIds" value={s.id} defaultChecked className="mt-1 accent-[var(--primary)]" /><span><span className="font-mono text-xs text-muted">{s.code}</span> {s.name} <Badge>{enumLabel(s.category)}</Badge> <Badge tone={s.testingType === "RED_TEAMING" ? "danger" : s.testingType === "USER_TESTING" ? "accent" : "info"}>{enumLabel(s.testingType)}</Badge><span className="block text-[11px] text-muted">{s.prompts} prompts</span></span></label>)}</div>
        </CardContent></Card>
      )}
      <Card><CardHeader><CardTitle>3. Execution mode & target adapter</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="flex gap-2">
          <button type="button" onClick={() => setMode("DEMO")} className={`flex-1 rounded-md border p-3 text-left text-sm ${mode === "DEMO" ? "border-primary bg-primary-soft/40" : "border-border"}`}><div className="font-medium">DEMO — simulated target</div><div className="text-xs text-muted">Deterministic synthetic responses with ground-truth tags. No API keys. Reproducible by seed.</div></button>
          <button type="button" onClick={() => setMode("LIVE")} className={`flex-1 rounded-md border p-3 text-left text-sm ${mode === "LIVE" ? "border-primary bg-primary-soft/40" : "border-border"}`}><div className="font-medium">LIVE — real model / agent</div><div className="text-xs text-muted">Calls the target via Anthropic, OpenAI-compatible or HTTP Evaluation API; LLM-as-judge annotates. {liveAvailable ? "Credentials detected." : "No credentials configured — add in Settings or paste a key below."}</div></button>
        </div>
        <input type="hidden" name="mode" value={mode} />
        {mode === "DEMO" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Field label="Weakness profile (0 = robust … 1 = very weak)"><Input name="weakness" type="number" step="0.05" min={0} max={1} defaultValue={0.25} /></Field><Field label="Seed (reproducibility)"><Input name="seed" placeholder="auto (run id)" /></Field></div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Target adapter"><Select name="adapter" value={adapter} onChange={(e) => setAdapter(e.target.value)}><option value="anthropic">Anthropic Messages API</option><option value="openai">OpenAI Chat Completions</option><option value="openai-compatible">OpenAI-compatible (Ollama, vLLM, gateway)</option><option value="http">HTTP Evaluation API (NIST ARIA-style contract)</option></Select></Field>
            <Field label="Model" hint={adapter === "http" ? "Ignored for HTTP targets" : credentials.find((c) => c.provider === adapter)?.defaultModel ? `Default from Settings: ${credentials.find((c) => c.provider === adapter)?.defaultModel}` : undefined}><Input name="model" placeholder={adapter === "anthropic" ? "claude-sonnet-5-5" : adapter === "openai" ? "gpt-4o-mini" : adapter === "openai-compatible" ? "llama3.3" : ""} /></Field>
            <Field label="Base URL" hint={adapter === "http" ? "POST endpoint implementing {sessionId, messages, tools} → {content, toolCalls}. Try the built-in sample: /api/evaluation-api/sample" : "Optional override (e.g. http://localhost:11434/v1)"}><Input name="baseUrl" placeholder={adapter === "http" ? "https://your-agent.example/evaluate" : ""} /></Field>
            <Field label="API key (optional — overrides saved credential)"><Input name="apiKey" type="password" autoComplete="off" /></Field>
            <Field label="System prompt for the target (optional)" className="md:col-span-2"><Textarea name="systemPrompt" placeholder="You are AcmeAssist, a customer support assistant…" /></Field>
            <Field label="Judge adapter"><Select name="judgeAdapter" defaultValue="anthropic"><option value="anthropic">Anthropic (LLM-as-judge)</option><option value="openai">OpenAI (LLM-as-judge)</option><option value="openai-compatible">OpenAI-compatible (local judge)</option><option value="rule">Rule-based only (no LLM judge)</option></Select></Field>
            <Field label="Judge model"><Input name="judgeModel" placeholder="claude-sonnet-5-5 / gpt-4o" /></Field>
          </div>
        )}
      </CardContent></Card>
      <div className="flex justify-end"><Button type="submit" size="lg">Start evaluation</Button></div>
    </form>
  );
}
