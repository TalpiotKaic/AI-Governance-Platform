export type Block =
  | { type: "paragraph"; text: string; tone?: "muted" | "warning" | "danger" | "success" }
  | { type: "kv"; items: { label: string; value: string }[] }
  | { type: "table"; columns: string[]; rows: (string | number | null)[][]; badgeColumns?: number[] }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "metrics"; items: { name: string; value: string; threshold: string; verdict: string; category: string; sampleSize?: number }[] }
  | { type: "findings"; items: { code: string; title: string; severity: string; category: string; excerpt?: string; recommendation?: string; status: string }[] }
  | { type: "score"; label: string; value: number | null; verdict: string }
  | { type: "signatures"; roles: { role: string; name: string; date: string }[] }
  | { type: "callout"; title: string; text: string; tone?: "info" | "warning" | "danger" | "success" };

export interface Section { id: string; title: string; blocks: Block[] }

export interface ReportContent {
  meta: { reportType: string; generatedAt: string; systemName: string; systemCode: string; organization: string; frameworks?: string[]; runCodes?: string[]; mode?: string; disclaimer?: string };
  sections: Section[];
}
