import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Todo } from "@/lib/todo";
import { fmtDate } from "@/lib/utils";

const PRIORITY: Record<Todo["priority"], { label: string; tone: "danger" | "warning" | "neutral" }> = {
  1: { label: "Urgent", tone: "danger" }, 2: { label: "Important", tone: "warning" }, 3: { label: "When possible", tone: "neutral" },
};

export function todoTitle(todo: Todo, t: (s: string) => string): string {
  return Object.entries(todo.vars ?? {}).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), t(todo.title));
}

/** Prioritized action list: what to do, why it matters, and a button straight to the place where it is done. */
export function TodoList({ todos, t, compact = false }: { todos: Todo[]; t: (s: string) => string; compact?: boolean }) {
  return (
    <ul className="divide-y divide-border">
      {todos.map((todo) => (
        <li key={todo.id} className="flex items-center gap-3 py-2.5">
          <Badge tone={PRIORITY[todo.priority].tone} className="shrink-0">{t(PRIORITY[todo.priority].label)}</Badge>
          <div className="min-w-0 flex-1">
            <p className={compact ? "truncate text-sm font-medium" : "text-sm font-medium"}>{todoTitle(todo, t)}</p>
            {!compact && <p className="text-xs text-muted">{t(todo.why)}{todo.due && <> · {t("Due")} {fmtDate(todo.due)}</>}</p>}
          </div>
          <Link href={todo.href} className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-surface-2">
            {t(todo.action)} <ArrowRight className="h-3 w-3" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
