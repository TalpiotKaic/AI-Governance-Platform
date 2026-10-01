import { DemoAdapter } from "@/lib/eval/adapters/demo";
import type { ChatMessage, ToolSpec } from "@/lib/eval/types";

/** Sample target implementing the K-VeriAI / NIST ARIA-style HTTP Evaluation API, backed by the demo simulator. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { sessionId?: string; messages?: ChatMessage[]; tools?: Partial<ToolSpec>[] };
  const adapter = new DemoAdapter({ adapter: "demo", weakness: 0.2, seed: "http-sample" });
  await adapter.startSession(body.sessionId ?? "sample");
  const tools = (body.tools ?? []).map((t) => ({ name: t.name ?? "tool", description: t.description ?? "", parameters: t.parameters ?? {}, riskLevel: "medium" as const, allowed: true }));
  const res = await adapter.getResponse(body.messages ?? [], tools.length ? tools : undefined);
  return Response.json({ content: res.content, toolCalls: res.toolCalls ?? [] });
}

export async function GET() {
  return Response.json({ name: "K-VeriAI sample Evaluation API target", contract: "POST {sessionId, messages, tools?} -> {content, toolCalls?}", docs: "/evaluation-api" });
}
