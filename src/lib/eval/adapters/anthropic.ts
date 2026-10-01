import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage, TargetAdapter, TargetConfig, TargetResponse, ToolSpec } from "../types";

export class AnthropicAdapter implements TargetAdapter {
  readonly kind = "anthropic";
  readonly label: string;
  private client: Anthropic;
  private model: string;
  private systemPrompt?: string;
  private temperature: number;

  constructor(cfg: TargetConfig) {
    this.client = new Anthropic({ apiKey: cfg.apiKey ?? process.env.ANTHROPIC_API_KEY, baseURL: cfg.baseUrl });
    this.model = cfg.model ?? "claude-sonnet-5-5";
    this.systemPrompt = cfg.systemPrompt;
    this.temperature = cfg.temperature ?? 0;
    this.label = `Anthropic · ${this.model}`;
  }
  async openConnection() {}
  async startSession() {}
  async closeConnection() {}

  async getResponse(messages: ChatMessage[], tools?: ToolSpec[]): Promise<TargetResponse> {
    const t0 = Date.now();
    const systemParts = [this.systemPrompt, ...messages.filter((m) => m.role === "system").map((m) => m.content)].filter(Boolean);
    // Convert to Anthropic message format with tool_use / tool_result blocks.
    type Block = Record<string, unknown>;
    const out: { role: "user" | "assistant"; content: string | Block[] }[] = [];
    for (const m of messages) {
      if (m.role === "system") continue;
      if (m.role === "user") out.push({ role: "user", content: m.content });
      else if (m.role === "assistant") {
        const blocks: Block[] = [];
        if (m.content) blocks.push({ type: "text", text: m.content });
        for (const tc of m.toolCalls ?? []) blocks.push({ type: "tool_use", id: tc.id, name: tc.name, input: tc.arguments });
        out.push({ role: "assistant", content: blocks.length ? blocks : m.content || "(no content)" });
      } else if (m.role === "tool") {
        const block: Block = { type: "tool_result", tool_use_id: m.toolCallId ?? "call", content: m.content };
        const last = out[out.length - 1];
        if (last && last.role === "user" && Array.isArray(last.content)) (last.content as Block[]).push(block);
        else out.push({ role: "user", content: [block] });
      }
    }
    const res = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      temperature: this.temperature,
      system: systemParts.length ? systemParts.join("\n\n") : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: out as any,
      tools: tools?.length
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (tools.map((t) => ({ name: t.name, description: t.description, input_schema: t.parameters })) as any)
        : undefined,
    });
    const text = res.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("\n");
    const toolCalls = res.content
      .filter((b) => b.type === "tool_use")
      .map((b) => {
        const tu = b as { id: string; name: string; input: Record<string, unknown> };
        return { id: tu.id, name: tu.name, arguments: tu.input ?? {} };
      });
    return {
      content: text,
      toolCalls: toolCalls.length ? toolCalls : undefined,
      latencyMs: Date.now() - t0,
      inputTokens: res.usage?.input_tokens,
      outputTokens: res.usage?.output_tokens,
    };
  }
}
