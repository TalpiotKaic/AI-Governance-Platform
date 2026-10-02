import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Printer, FileJson } from "lucide-react";
import { requireUser, hasRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge, toneForStatus } from "@/components/ui/badge";
import { ReportRenderer } from "@/components/domain/report-renderer";
import type { ReportContent } from "@/lib/reports/types";
import { getI18n } from "@/lib/i18n/server";

import { reportWorkflowAction, regenerateReportInLanguageAction } from "../actions";

export default async function ReportPage(props: PageProps<"/reports/[id]">) {
  const { t, L } = await getI18n();
  const user = await requireUser();
  const { id } = await props.params;
  const r = await db.report.findFirst({ where: { id, orgId: user.orgId }, include: { system: true, createdBy: true, reviewer: true, approver: true, supersedes: true, supersededBy: true } });
  if (!r) notFound();
  const content = r.content as unknown as ReportContent;
  const act = (a: "submit" | "review" | "approve" | "issue" | "reject") => reportWorkflowAction.bind(null, r.id, a);
  return (
    <>
      <PageHeader title={`${r.code} · ${L(r.type)}`} crumbs={[{ label: "Reports & Packs", href: "/reports" }, { label: r.code }]} description={r.title}
        actions={<>
          <a href={`/print/reports/${r.id}`} target="_blank"><Button variant="outline"><Printer className="h-4 w-4" /> {t("Print view")}</Button></a>
          <a href={`/api/reports/${r.id}/pdf`}><Button variant="outline"><Download className="h-4 w-4" /> PDF</Button></a>
          <a href={`/api/reports/${r.id}/export`}><Button variant="outline"><FileJson className="h-4 w-4" /> JSON</Button></a>
        </>} />
      <div className="no-print mb-4 flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface px-4 py-3 text-sm">
        <Badge tone={toneForStatus(r.status)}>{L(r.status)}</Badge><span className="text-muted">v{r.version}</span><Badge tone="neutral">{r.language === "ko" ? "한국어" : "English"}</Badge>
        <span className="text-xs text-muted">Created by {r.createdBy?.name}{r.reviewer && ` · reviewed by ${r.reviewer.name}`}{r.approver && ` · approved by ${r.approver.name}`}</span>
        {r.supersedes && <Link href={`/reports/${r.supersedesId}`} className="text-xs text-primary hover:underline">supersedes v{r.supersedes.version}</Link>}{r.supersededBy && <Link href={`/reports/${r.supersededBy.id}`} className="text-xs text-primary hover:underline">superseded by v{r.supersededBy.version}</Link>}
        <span className="flex-1" />
        {hasRole(user, "TESTER") && <form action={regenerateReportInLanguageAction.bind(null, r.id, r.language === "ko" ? "en" : "ko")}><Button size="sm" type="submit" variant="ghost">{t(r.language === "ko" ? "Regenerate in English" : "Regenerate in Korean")}</Button></form>}
        {r.status === "DRAFT" && <form action={act("submit")}><Button size="sm" type="submit" variant="outline">{t("Submit for review")}</Button></form>}
        {r.status === "IN_REVIEW" && hasRole(user, "REVIEWER") && <form action={act("review")}><Button size="sm" type="submit" variant="outline">{t("Mark reviewed")}</Button></form>}
        {(r.status === "IN_REVIEW") && hasRole(user, "APPROVER") && <form action={act("approve")}><Button size="sm" type="submit" variant="outline">{t("Approve")}</Button></form>}
        {(r.status === "APPROVED" || r.status === "IN_REVIEW") && hasRole(user, "APPROVER") && <form action={act("issue")}><Button size="sm" type="submit">{t("Issue")}</Button></form>}
        {(r.status === "IN_REVIEW" || r.status === "APPROVED") && hasRole(user, "REVIEWER") && <form action={act("reject")}><Button size="sm" type="submit" variant="ghost">{t("Return to draft")}</Button></form>}
      </div>
      <div className="rounded-lg border border-border bg-surface p-6 md:p-10"><ReportRenderer content={content} code={r.code} version={r.version} status={r.status} issuedAt={r.issuedAt} /></div>
    </>
  );
}
