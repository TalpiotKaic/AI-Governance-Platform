import { requirePagePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { getI18n } from "@/lib/i18n/server";

import { generateReportAction } from "../actions";
import { REPORT_TITLES } from "@/lib/reports/service";
import { rt } from "@/lib/reports/dict";

export default async function NewReportPage(props: PageProps<"/reports/new">) {
  const { t, L, locale } = await getI18n();
  const user = await requirePagePermission("reports.generate");
  const sp = await props.searchParams;
  const systems = await db.aiSystem.findMany({ where: { orgId: user.orgId }, orderBy: { code: "asc" } });
  const systemId = typeof sp.systemId === "string" ? sp.systemId : systems[0]?.id;
  const runs = await db.evaluationRun.findMany({ where: { orgId: user.orgId, systemId, status: "COMPLETED" }, orderBy: { createdAt: "desc" } });
  const plans = await db.evaluationPlan.findMany({ where: { orgId: user.orgId, systemId }, orderBy: { createdAt: "desc" } });
  const users = await db.user.findMany({ where: { orgId: user.orgId } });
  const type = typeof sp.type === "string" ? sp.type : "EVALUATION_REPORT";
  const runId = typeof sp.runId === "string" ? sp.runId : runs[0]?.id;
  return (
    <>
      <PageHeader title={t("Generate report")} crumbs={[{ label: "Reports & Packs", href: "/reports" }, { label: "Generate" }]} description={t("Reports are built from platform records (runs, risks, controls, evidence). Change the system to reload its runs and plans.")} />
      <Card><CardHeader><CardTitle>{t("Report parameters")}</CardTitle><CardDescription>{t("Evidence packs need no run; evaluation & verification reports need at least one completed run; the ARIA report needs a plan.")}</CardDescription></CardHeader><CardContent>
        <form className="mb-4 flex items-end gap-2"><Field label={t("AI system")}><Select name="systemId" defaultValue={systemId} className="w-80">{systems.map((s) => <option key={s.id} value={s.id}>{s.code} · {s.name}</option>)}</Select></Field><input type="hidden" name="type" value={type} /><Button type="submit" variant="outline">{t("Load")}</Button></form>
        <form action={generateReportAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input type="hidden" name="systemId" value={systemId} />
          <Field label={t("Report type")}><Select name="type" defaultValue={type}>{Object.entries(REPORT_TITLES).map(([k, v]) => <option key={k} value={k}>{rt(locale, v)}</option>)}</Select></Field>
          <Field label={t("Evaluation run(s)")} hint={t("Hold Ctrl/Cmd to select several (verification report). Ignored for evidence packs and passport.")}><select name="runIds" multiple defaultValue={runId ? [runId] : []} className="h-28 w-full rounded-md border border-border bg-surface px-2 text-sm">{runs.map((r) => <option key={r.id} value={r.id}>{r.code} · {r.name} ({r.mode}, {L(r.verdict)})</option>)}</select></Field>
          <Field label={t("Report language")} hint={t("Language of the generated report content. Versions are tracked per language.")}><Select name="language" defaultValue={typeof sp.language === "string" ? sp.language : locale}><option value="en">English</option><option value="ko">한국어</option></Select></Field>
          <Field label={t("Evaluation plan (ARIA report)")}><Select name="planId" defaultValue={typeof sp.planId === "string" ? sp.planId : ""}><option value="">—</option>{plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></Field>
          <div className="grid grid-cols-3 gap-2 md:col-span-2"><Field label={t("Tester (signature block)")}><Input name="tester" defaultValue={users.find((u) => u.role === "TESTER")?.name ?? user.name} /></Field><Field label={t("Reviewer")}><Input name="reviewer" defaultValue={users.find((u) => u.role === "REVIEWER")?.name ?? ""} /></Field><Field label={t("Approver")}><Input name="approver" defaultValue={users.find((u) => u.role === "APPROVER")?.name ?? ""} /></Field></div>
          <div className="flex justify-end md:col-span-2"><Button type="submit">{t("Generate")}</Button></div>
        </form>
      </CardContent></Card>
    </>
  );
}
