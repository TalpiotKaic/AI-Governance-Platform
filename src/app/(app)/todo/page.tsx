import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { TodoList } from "@/components/domain/todo-list";
import { getI18n } from "@/lib/i18n/server";
import { buildTodos } from "@/lib/todo";
import { ensureOverdueRiskTasks } from "@/lib/risks/due";
import { ensureDocumentLifecycle } from "@/lib/documents";

export const metadata = { title: "To-do" };

export default async function TodoPage() {
  const { t } = await getI18n();
  const user = await requireUser();
  await ensureOverdueRiskTasks(user.orgId);
  await ensureDocumentLifecycle(user.orgId);
  const todos = await buildTodos(user);
  const n = (p: number) => todos.filter((x) => x.priority === p).length;
  return (
    <>
      <PageHeader title={t("To-do")} description={t("Everything that needs your attention, gathered from the inventory, risks, documents, evaluations, vendors and approvals — most urgent first. Each item takes you straight to where it is done; completed items disappear automatically.")} />
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Stat label={t("Urgent")} value={n(1)} tone={n(1) ? "danger" : undefined} />
        <Stat label={t("Important")} value={n(2)} tone={n(2) ? "warning" : undefined} />
        <Stat label={t("When possible")} value={n(3)} />
      </div>
      <Card><CardContent className="py-2">
        {todos.length ? <TodoList todos={todos} t={t} /> : (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <p>{t("Nothing to do right now.")}</p>
            <Link href="/dashboard" className="text-primary hover:underline">{t("Dashboard")}</Link>
          </div>
        )}
      </CardContent></Card>
    </>
  );
}
