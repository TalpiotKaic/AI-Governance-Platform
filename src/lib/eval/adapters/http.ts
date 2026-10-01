import type { ChatMessage, TargetAdapter, TargetConfig, TargetResponse, ToolSpec } from "../types";

/**
 * Generic HTTP adapter implementing the NIST ARIA-style Evaluation API contract.
 * The system under test exposes POST {baseUrl} and receives:
 *   { sessionId, messages:[{role, content, toolCalls?, toolCallId?}], tools?:[...] }
 * and must respond with:
 *   { content: string, toolCalls?: [{id, name, arguments}] }
 */
export class HttpAdapter implements TargetAdapter {
  readonly kind = "http";
  readonly label: string;
  private url: string;
  private headers: Record<string, string>;
  private sessionId = "";
  private systemPrompt?: string;

  constructor(cfg: TargetConfig) {
    if (!cfg.baseUrl) throw new Error("HTTP adapter requires baseUrl");
    this.url = cfg.baseUrl;
    this.headers = { "content-type": "application/json", ...(cfg.headers ?? {}) };
    if (cfg.apiKey) this.headers.authorization = `Bearer ${cfg.apiKey}`;
    this.systemPrompt = cfg.systemPrompt;
    this.label = `HTTP · ${new URL(cfg.baseUrl).host}`;
  }
  async openConnection() {}
  async startSession(sessionId: string) { this.sessionId = sessionId; }
  async closeConnection() {}

  async getResponse(messages: ChatMessage[], tools?: ToolSpec[]): Promise<TargetResponse> {
    const t0 = Date.now();
    const res = await fetch(this.url, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ sessionId: this.sessionId, systemPrompt: this.systemPrompt, messages, tools: tools?.map((t) => ({ name: t.name, description: t.description, parameters: t.parameters })) }),
    });
    if (!res.ok) throw new Error(`Target returned HTTP ${res.status}`);
    const data = (await res.json()) as { content?: string; toolCalls?: { id?: string; name: string; arguments?: Record<string, unknown> }[] };
    return {
      content: data.content ?? "",
      toolCalls: data.toolCalls?.map((tc, i) => ({ id: tc.id ?? `call_${i}`, name: tc.name, arguments: tc.arguments ?? {} })),
      latencyMs: Date.now() - t0,
    };
  }
}
