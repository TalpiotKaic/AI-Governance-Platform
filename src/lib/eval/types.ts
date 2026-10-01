// Core types for the K-VeriAI evaluation engine.
// Modeled on the NIST AI 200-3 "Evaluation API": OpenConnection / StartSession / GetResponse / CloseConnection.

export type ChatRole = "system" | "user" | "assistant" | "tool";

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ChatMessage {
  role: ChatRole;
  content: string;
  toolCalls?: ToolCall[];
  toolCallId?: string; // for role=tool
  toolName?: string;
}

export type ToolRiskLevel = "low" | "medium" | "high" | "critical";

export interface ToolSpec {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON schema
  riskLevel: ToolRiskLevel;
  allowed: boolean; // whether the governed agent is permitted to use the tool
  requiresApproval?: boolean;
  permissions?: string[];
}

export interface TargetResponse {
  content: string;
  toolCalls?: ToolCall[];
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  /** Hidden ground-truth metadata emitted only by the demo adapter. */
  demoMeta?: Record<string, unknown>;
}

export interface TargetAdapter {
  readonly kind: string;
  readonly label: string;
  openConnection(): Promise<void>;
  startSession(sessionId: string): Promise<void>;
  getResponse(messages: ChatMessage[], tools?: ToolSpec[]): Promise<TargetResponse>;
  closeConnection(): Promise<void>;
}

export interface TargetConfig {
  adapter: "anthropic" | "openai" | "openai-compatible" | "http" | "demo";
  model?: string;
  baseUrl?: string;
  apiKey?: string;
  systemPrompt?: string;
  temperature?: number;
  /** demo adapter only: 0 (robust) .. 1 (very weak) */
  weakness?: number;
  /** demo adapter only: deterministic seed */
  seed?: string;
  /** optional HTTP headers for http adapter */
  headers?: Record<string, string>;
}

export interface JudgeConfig {
  adapter: "anthropic" | "openai" | "openai-compatible" | "demo" | "rule";
  model?: string;
  baseUrl?: string;
  apiKey?: string;
}

export interface AnnotationItem {
  key: string;
  question: string;
  type: "boolean" | "scale" | "choice";
  options?: string[];
  /** Which value(s) count as a violation (default "yes" for boolean). Comma-separated for choice items. */
  violationValue?: string;
  /** For scale items: minimum acceptable value (inclusive) if higher is better; or max acceptable if lowerIsBetter. */
  passThreshold?: number;
  lowerIsBetter?: boolean;
  severityWeight?: number; // 1..5
  /** maps this item to a metric key, so the metric aggregator can roll it up */
  metricKey?: string;
}

export interface ScenarioPrompt {
  id: string;
  /** Sequential user turns (multi-turn adversarial scripts use several). */
  turns: { role: "user" | "system"; content: string }[];
  /** Optional retrieved context to inject (RAG faithfulness tests). */
  context?: string;
  expected?: string;
  mustNotContain?: string[];
  mustContainAny?: string[];
  tags?: string[];
  /** Agent expectations */
  expectedTool?: string | null; // tool that should be called (null = must NOT call any tool)
  expectedArgs?: Record<string, unknown>;
  forbiddenTools?: string[];
  /** Fairness: id of the paired counterfactual prompt */
  pairWith?: string;
  /** For demo adapter: ground-truth hint about what a failure looks like */
  demoFailureMode?: string;
}

export interface JudgeResult {
  [itemKey: string]: { value: string; rationale?: string; confidence?: number };
}

export interface MetricSpec {
  key: string;
  name: string;
  direction: "higher" | "lower";
  threshold: number;
  unit?: string; // "rate" | "score" | "ms"
  /** How session-level annotations roll up into the metric. */
  aggregate?: "violation_rate" | "compliance_rate" | "mean_scale" | "mean" | "pair_inconsistency_rate";
  /** Annotation item key this metric is computed from (defaults to key). */
  itemKey?: string;
}
