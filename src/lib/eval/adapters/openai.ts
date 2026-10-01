import OpenAI from "openai";
import type { ChatMessage, TargetAdapter, TargetConfig, TargetResponse, ToolSpec } from "../types";

/** OpenAI and OpenAI-compatible endpoints (Ollama, vLLM, Azure OpenAI gateway, etc.). */
export class OpenAICompatibleAdapter implements TargetAdapter {
  readonly kind: string;
  readonly label: string;
  private client: OpenAI;
  private model: string;
  private systemPrompt?: string;
  private temperature: number;

  constructor(cfg: TargetConfig) {
    this.kind = cfg.adapter === "openai" ? "openai" : "openai-compatible";
    const baseURL = cfg.baseUrl ?? (cfg.adapter === "openai-compatible" ? process.env.OLLAMA_BASE_URL : undefined);
    this.client = new OpenAI({ apiKey: cfg.apiKey ?? process.env.OPENAI_API_KEY ?? "ollama", baseURL });
    this.model = cfg.model ?? "gpt-4o-mini";
    this.systemPrompt = cfg.systemPrompt;
    this.temperature = cfg.temperature ?? 0;
    this.label = `${this.kind === "openai" ? "OpenAI" : "OpenAI-compatible"} · ${this.model}`;
  }
  async openConnection() {}
  async startSession() {}
  async closeConnection() {}

  async getResponse(messages: ChatMessage[], tools?: ToolSpec[]): Promise<TargetResponse> {
    const t0 = Date.now();
    const msgs: Record<string, unknown>[] = [];
    if (this.systemPrompt) msgs.push({ role: "system", content: this.systemPrompt });
    for (const m of messages) {
      if (m.role === "assistant") {
        msgs.push({
          role: "assistant",
          content: m.content || null,
          tool_calls: m.toolCalls?.map((tc) => ({ id: tc.id, type: "function", function: { name: tc.name, arguments: JSON.stringify(tc.arguments) } })),
        });
      } else if (m.role === "tool") {
        msgs.push({ role: "tool", tool_call_id: m.toolCallId, content: m.content });
      } else {
        msgs.push({ role: m.role, content: m.content });
      }
    }
    const res = await this.client.chat.completions.create({
      model: this.model,
      temperature: this.temperature,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: msgs as any,
      tools: tools?.length
        ? tools.map((t) => ({ type: "function" as const, function: { name: t.name, description: t.description, parameters: t.parameters } }))
        : undefined,
    });
    const choice = res.choices[0];
    const toolCalls = (choice?.message?.tool_calls ?? [])
      .filter((tc) => tc.type === "function")
      .map((tc) => {
        const fn = (tc as { id: string; function: { name: string; arguments: string } });
        let args: Record<string, unknown> = {};
        try { args = JSON.parse(fn.function.arguments || "{}"); } catch { args = { _raw: fn.function.arguments }; }
        return { id: fn.id, name: fn.function.name, arguments: args };
      });
    return {
      content: choice?.message?.content ?? "",
      toolCalls: toolCalls.length ? toolCalls : undefined,
      latencyMs: Date.now() - t0,
      inputTokens: res.usage?.prompt_tokens,
      outputTokens: res.usage?.completion_tokens,
    };
  }
}
