import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtDate(d: Date | string | null | undefined, withTime = false) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return format(date, withTime ? "yyyy-MM-dd HH:mm" : "yyyy-MM-dd");
}

export function fmtAgo(d: Date | string | null | undefined) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return formatDistanceToNow(date, { addSuffix: true });
}

export function pct(v: number | null | undefined, digits = 0) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `${(v * 100).toFixed(digits)}%`;
}

export function num(v: number | null | undefined, digits = 2) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return v.toFixed(digits);
}

const ACRONYMS: Record<string, string> = {
  iso: "ISO/IEC", eu: "EU", ai: "AI", act: "Act", nist: "NIST", rmf: "RMF", aria: "ARIA", kr: "KR", rag: "RAG", llm: "LLM", pii: "PII", dpia: "DPIA", gpai: "GPAI", mcp: "MCP", ml: "ML", saas: "SaaS", api: "API", id: "ID", phi: "PHI", roi: "ROI",
};

export function titleCase(s: string) {
  return s
    .toLowerCase()
    .split(/[_\s]+/)
    .map((w) => (w ? ACRONYMS[w] ?? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function enumLabel(s: string | null | undefined) {
  if (!s) return "—";
  const special: Record<string, string> = {
    EU_AI_ACT: "EU AI Act",
    ISO_42001: "ISO/IEC 42001",
    NIST_AI_RMF: "NIST AI RMF",
    NIST_ARIA: "NIST ARIA",
    KR_AI_BASIC_ACT: "KR AI Basic Act",
    GPAI: "GPAI",
    GPAI_SYSTEMIC: "GPAI (systemic risk)",
    LLM_APPLICATION: "LLM Application",
    RAG_ASSISTANT: "RAG Assistant",
    PREDICTIVE_ML: "Predictive ML",
    MULTI_AGENT: "Multi-Agent",
    EXTERNAL_SAAS: "External SaaS AI",
    DPIA: "DPIA",
    PII: "PII",
    AI_PASSPORT: "AI Passport",
    LLM_JUDGE: "LLM Judge",
  };
  return special[s] ?? titleCase(s);
}

export function nextCode(prefix: string, count: number) {
  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
}

/** Risk score: likelihood weighted 1x, severity weighted 3x (VerifyWise-style), scaled to 0–100. */
export function riskScore(likelihood: number, severity: number) {
  const raw = likelihood * 1 + severity * 3; // max 20
  return Math.round((raw / 20) * 100);
}

export function riskTierFromScore(score: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 35) return "MEDIUM";
  return "LOW";
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function safeJson<T>(v: unknown, fallback: T): T {
  if (v === null || v === undefined) return fallback;
  return v as T;
}
