import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser, userCan } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge, toneForStatus } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { fmtDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n/server";
import { daysUntil, docStatusLabel, documentStats, ensureDocumentLifecycle, isReviewDueSoon } from "@/lib/documents";
import { ProcessStrip } from "./process-strip";
import { BaselineCard } from "./baseline-card";

export const metadata = { title: "Policies & documents" };

const FILTERS: Record<string, string[]> = { all: [], active: ["ACTIVE"], review: ["IN_REVIEW"], expired: ["EXPIRED"], draft: ["DRAFT"], history: ["SUPERSEDED", "RETIRED"] };

export default async function PoliciesPage(props: PageProps<"/policies">) {
  const { t, L, locale } = await getI18n();
  const user = await requireUser();
  const sp = await props.searchParams;
  const f = typeof sp.f === "string" && (sp.f in FILTERS || sp.f === "due") ? sp.f : "current";
  await ensureDocumentLifecycle(user.orgId);
  const stats = await documentStats(user.orgId);
  const all = await db.policy.findMany({ where: { orgId: user.orgId }, orderBy: [{ updatedAt: "desc" }], include: { owner: true } });
  const users = new Map((await db.user.findMany({ where: { orgId: user.orgId }, select: { id: true, name: true } })).map((u) => [u.id, u.name]));
  const docs = all.filter((d) => f === "current" ? !["SUPERSEDED", "RETIRED"].includes(d.status) : f === "due" ? isReviewDueSoon(d) : f === "all" ? true : FILTERS[f].includes(d.status));
  const order = ["EXPIRED", "IN_REVIEW", "DRAFT", "ACTIVE", "SUPERSEDED", "RETIRED"];
  docs.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
  const chip = (key: string, label: string, n?: number) => <Link key={key} href={key === "current" ? "/policies" : `/policies?f=${key}`}><Badge tone={f === key ? "primary" : "neutral"} className="cursor-pointer">{label}{n !== undefined ? ` (${n})` : ""}</Badge></Link>;
  return (
    <>
      <PageHeader title={t("Policies & documents")} description={t("Organisation-level governance documents — policies, procedures, roles and responsibilities, objectives, plans and records rules. Write or attach them once, have them reviewed, and they are published as organisation-wide evidence that counts for every AI system. Review dates are monitored. System-specific documents and test results belong in the Evidence Center.")} actions={userCan(user, "policies.write") && <Link href="/policies/new"><Button><Plus className="h-4 w-4" /> {t("New document")}</Button></Link>} />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label={t("In force")} value={stats.active} tone={stats.active ? "success" : undefined} />
        <Stat label={t("Awaiting review")} value={stats.inReview} tone={stats.inReview ? "info" : undefined} />
        <Stat label={t("Review due within 30 days")} value={stats.dueSoon} tone={stats.dueSoon ? "warning" : undefined} />
        <Stat label={t("Expired")} value={stats.expired} tone={stats.expired ? "danger" : undefined} hint={stats.expired ? t("No longer counts as evidence") : undefined} />
        <Stat label={t("Drafts")} value={stats.drafts} />
      </div>
      <div className="mb-4"><ProcessStrip /></div>
      {typeof sp.created === "string" && <div className="mb-4 rounded-md border border-success/40 bg-success-soft px-3 py-2 text-sm text-success">{t("{n} draft(s) created from the baseline set. Open each one, replace the [ ] placeholders and request review.").replace("{n}", String(Number(sp.created) || 0))}</div>}
      <BaselineCard docs={all} locale={locale} canWrite={userCan(user, "policies.write")} t={t} L={L} />
      <div className="mb-3 flex flex-wrap gap-1.5">
        {chip("current", t("Current"))}{chip("active", t("In force"), stats.active)}{chip("review", t("Awaiting review"), stats.inReview)}{chip("due", t("Review due"), stats.dueSoon)}{chip("expired", t("Expired"), stats.expired)}{chip("draft", L("DRAFT"), stats.drafts)}{chip("history", t("History"))}{chip("all", t("All"))}
      </div>
      <Card><CardContent className="px-0 pb-0 pt-0">
        <Table><THead><TR><TH>{t("Document")}</TH><TH>{t("Version")}</TH><TH>{t("Status")}</TH><TH>{t("Controls")}</TH><TH>{t("Owner")}</TH><TH>{t("Approved")}</TH><TH>{t("Next review")}</TH></TR></THead><TBody>
          {docs.map((d) => { const dueSoon = isReviewDueSoon(d); return (
            <TR key={d.id}>
              <TD><Link href={`/policies/${d.id}`} className="font-medium hover:underline">{d.title}</Link><div className="mt-0.5 flex flex-wrap gap-1"><Badge>{L(`DOC_${d.docType}`)}</Badge>{d.fileName && <span className="text-[11px] text-muted">📎 {d.fileName}</span>}</div></TD>
              <TD className="text-xs tabular-nums">v{d.version}</TD>
              <TD><Badge tone={d.status === "EXPIRED" ? "danger" : d.status === "IN_REVIEW" ? "info" : toneForStatus(d.status)}>{docStatusLabel(d.status, t, L)}</Badge>{d.selfApproved && d.status === "ACTIVE" && <div className="mt-0.5"><Badge tone="warning">{t("Self-reviewed")}</Badge></div>}</TD>
              <TD className="font-mono text-[11px]">{d.controlCodes.join(", ") || <span className="text-muted">—</span>}</TD>
              <TD className="text-xs">{d.owner?.name ?? "—"}</TD>
              <TD className="text-xs text-muted">{d.approvedAt ? <>{fmtDate(d.approvedAt)}<div>{users.get(d.approvedById ?? "") ?? ""}</div></> : "—"}</TD>
              <TD className="text-xs">{d.nextReviewDate && ["ACTIVE", "EXPIRED"].includes(d.status) ? <>{fmtDate(d.nextReviewDate)}{d.status === "EXPIRED" ? <div><Badge tone="danger">{t("Expired")}</Badge></div> : dueSoon ? <div><Badge tone="warning">{t("in {n} days").replace("{n}", String(daysUntil(d.nextReviewDate)))}</Badge></div> : null}</> : <span className="text-muted">—</span>}</TD>
            </TR>); })}
          {docs.length === 0 && <TR><TD colSpan={7} className="py-6 text-center text-sm text-muted">{t("No documents in this view.")}</TD></TR>}
        </TBody></Table>
      </CardContent></Card>
    </>
  );
}
