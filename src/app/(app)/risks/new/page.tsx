import { requirePagePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { createRiskAction } from "../actions";
import { getI18n } from "@/lib/i18n/server";


export default async function NewRiskPage(props: PageProps<"/risks/new">) {
  const { t, L } = await getI18n();
  const user = await requirePagePermission("risks.write");
  const sp = await props.searchParams;
  const systems = await db.aiSystem.findMany({ where: { orgId: user.orgId }, orderBy: { code: "asc" } });
  const dims = ["ACCURACY_EFFICACY", "BIAS_FAIRNESS", "ROBUSTNESS", "SAFETY", "SECURITY", "PRIVACY", "TRANSPARENCY_EXPLAINABILITY", "ACCOUNTABILITY", "AGENT_BEHAVIOR", "EXPOSURE"];
  return (
    <>
      <PageHeader title={t("Add risk")} crumbs={[{ label: "Risk Register", href: "/risks" }, { label: "New" }]} />
      <Card><CardContent className="pt-5">
        <form action={createRiskAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={t("AI system")}><Select name="systemId" defaultValue={typeof sp.systemId === "string" ? sp.systemId : systems[0]?.id} required>{systems.map((s) => <option key={s.id} value={s.id}>{s.code} · {s.name}</option>)}</Select></Field>
          <Field label={t("Dimension")}><Select name="dimension" defaultValue="SECURITY">{dims.map((d) => <option key={d} value={d}>{L(d)}</option>)}</Select></Field>
          <Field label={t("Title")} className="md:col-span-2"><Input name="title" required /></Field>
          <Field label={t("Description")} className="md:col-span-2"><Textarea name="description" /></Field>
          <Field label={t("Likelihood (1–5)")}><Input name="likelihood" type="number" min={1} max={5} defaultValue={3} required /></Field>
          <Field label={t("Severity (1–5)")}><Input name="severity" type="number" min={1} max={5} defaultValue={3} required /></Field>
          <Field label={t("Mitigation plan")} className="md:col-span-2"><Textarea name="mitigation" /></Field>
          <Field label={t("Due date")}><Input name="dueDate" type="date" /></Field>
          <div className="flex items-end justify-end md:col-span-2"><Button type="submit">{t("Add risk")}</Button></div>
        </form>
      </CardContent></Card>
    </>
  );
}
