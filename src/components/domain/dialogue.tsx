import { cn } from "@/lib/utils";
import { Bot, User, Wrench, Settings2 } from "lucide-react";

type Turn = { id: string; index: number; role: string; content: string; toolCalls: unknown; latencyMs: number | null };

export function DialogueViewer({ turns }: { turns: Turn[] }) {
  return (
    <div className="space-y-2">
      {turns.map((t) => {
        const isUser = t.role === "USER";
        const isTool = t.role === "TOOL";
        const isSystem = t.role === "SYSTEM";
        const Icon = isUser ? User : isTool ? Wrench : isSystem ? Settings2 : Bot;
        const calls = (t.toolCalls as { name: string; arguments: Record<string, unknown> }[] | null) ?? null;
        return (
          <div key={t.id} className={cn("flex gap-2", isUser && "flex-row-reverse")}>
            <div className={cn("mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full", isUser ? "bg-accent-soft text-accent" : isTool ? "bg-warning-soft text-warning" : isSystem ? "bg-surface-2 text-muted" : "bg-primary-soft text-primary")}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className={cn("max-w-[85%] rounded-lg border border-border px-3 py-2 text-sm", isUser ? "bg-accent-soft/40" : isTool ? "bg-warning-soft/30 font-mono text-xs" : isSystem ? "bg-surface-2 text-xs text-muted" : "bg-surface")}>
              <div className="mb-0.5 flex items-center gap-2 text-[10px] uppercase tracking-wide text-muted">
                <span>{t.role.toLowerCase()}</span>
                {t.latencyMs !== null && <span>· {t.latencyMs} ms</span>}
              </div>
              <div className="whitespace-pre-wrap break-words">{t.content || <span className="italic text-muted">(no text)</span>}</div>
              {calls && calls.length > 0 && (
                <div className="mt-2 space-y-1">
                  {calls.map((c, i) => (
                    <div key={i} className="rounded border border-border bg-surface-2 px-2 py-1 font-mono text-[11px]">
                      <span className="font-semibold text-foreground">{c.name}</span>(<span className="text-muted">{JSON.stringify(c.arguments)}</span>)
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
