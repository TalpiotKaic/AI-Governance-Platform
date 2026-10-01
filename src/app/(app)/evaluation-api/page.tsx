import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata = { title: "Evaluation API" };

export default function EvaluationApiPage() {
  const req = `POST https://your-agent.example/evaluate
Content-Type: application/json
Authorization: Bearer <optional>

{
  "sessionId": "cm1…",                      // NIST ARIA SessionID (one per tester–application interaction)
  "systemPrompt": "optional system prompt configured in the run",
  "messages": [
    { "role": "user", "content": "Delete the customer record for C-1042" },
    { "role": "assistant", "content": "…", "toolCalls": [{ "id": "c1", "name": "escalate_to_human", "arguments": { "reason": "…" } }] },
    { "role": "tool", "toolCallId": "c1", "toolName": "escalate_to_human", "content": "{\\"status\\":\\"escalated\\"}" }
  ],
  "tools": [ { "name": "lookup_customer", "description": "…", "parameters": { "type": "object", … } } ]   // only for agent systems
}`;
  const res = `200 OK
{
  "content": "I can't delete records directly; I've escalated this to a human operator.",
  "toolCalls": [ { "id": "c1", "name": "escalate_to_human", "arguments": { "reason": "Destructive action requested" } } ]   // optional
}`;
  return (
    <>
      <PageHeader title="HTTP Evaluation API" description="Implement this contract on your model or agent to evaluate it in LIVE mode without sharing credentials. It mirrors the NIST AI 200-3 Evaluation API (OpenConnection / StartSession / GetResponse / CloseConnection): K-VeriAI sends the running dialogue and (for agents) the sandbox tool catalogue; your system returns the next assistant message and any tool calls. Tool calls are executed by the K-VeriAI sandbox (mocked, no side effects) and the results are fed back on the next request." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Request (per turn)</CardTitle></CardHeader><CardContent><pre className="overflow-x-auto rounded-md bg-surface-2 p-3 text-xs">{req}</pre></CardContent></Card>
        <Card><CardHeader><CardTitle>Response</CardTitle></CardHeader><CardContent><pre className="overflow-x-auto rounded-md bg-surface-2 p-3 text-xs">{res}</pre></CardContent></Card>
        <Card className="lg:col-span-2"><CardHeader><CardTitle>Try it</CardTitle><CardDescription>A sample target implementing this contract is built in. In a new LIVE evaluation choose adapter “HTTP Evaluation API” and set Base URL to <code>{"{origin}"}/api/evaluation-api/sample</code> (backed by the demo simulator). Judge adapter can be “Rule-based only” if you have no LLM credentials.</CardDescription></CardHeader><CardContent className="text-sm text-muted"><ul className="list-disc space-y-1 pl-5"><li>Statelessness: the full dialogue is sent each turn; you may key caches on <code>sessionId</code>.</li><li>Tool calling: return <code>toolCalls</code> with JSON arguments; K-VeriAI records them (DialogueTurn role TOOL) and evaluates tool-call accuracy, forbidden-tool use, unsafe actions and exfiltration attempts.</li><li>Timeouts: respond within 30 s per turn; a failed turn marks the session NOT_EVALUATED and continues the run.</li></ul></CardContent></Card>
      </div>
    </>
  );
}
