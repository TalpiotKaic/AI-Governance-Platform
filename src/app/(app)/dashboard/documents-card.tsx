import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fmtDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n/server";
import { daysUntil, documentStats, documentsNeedingAttention, ensureDocumentLifecycle } from "@/lib/documents";

const TONE = { success: "text-success", info: "text-info", warning: "text-warning", danger: "text-danger", neutral: "" } as const;

/** Dashboard: governance documents and evidence validity — what is in force, awaiting review, due or expired. */
export async function DocumentsCard({ orgId }: { orgId: string }) {
  const { t } = await getI18n();
  await ensureDocumentLifecycle(orgId);
  const stats = await documentStats(orgId);
  const { documents: attention, evidence: evSoon } = await documentsNeedingAttention(orgId);
  const tile = (label: string, value: number, tone: keyof typeof TONE, href: string) => (
    <Link href={href} className="rounded-md border border-border px-3 py-2 hover:bg-surface-2/60"><p className="text-[11px] text-muted">{label}</p><p className={`text-xl font-semibold tabular-nums ${value ? TONE[tone] : ""}`}>{value}</p></Link>
  );
  const why = (d: { status: string; nextReviewDate: Date | null }) =>
    d.status === "EXPIRED" ? <Badge tone="danger">{t("Expired")}</Badge>
    : d.status === "IN_REVIEW" ? <Badge tone="info">{t("Awaiting review")}</Badge>
    : <Badge tone="warning">{t("Review in {n} days").replace("{n}", String(Math.max(0, daysUntil(d.nextReviewDate!))))}</Badge>;
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-2"><div><CardTitle>{t("Governance documents & evidence validity")}</CardTitle><CardDescription>{t("Organisation-wide documents count as evidence for every system only while approved and within their review date.")}</CardDescription></div><Link href="/policies" className="shrink-0 text-xs text-primary hover:underline">{t("Policies & documents")} →</Link></CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:col-span-3">
          {tile(t("In force"), stats.active, "success", "/policies?f=active")}
          {tile(t("Awaiting review"), stats.inReview, "info", "/policies?f=review")}
          {tile(t("Review due within 30 days"), stats.dueSoon, "warning", "/policies?f=due")}
          {tile(t("Expired documents"), stats.expired, "danger", "/policies?f=expired")}
          {tile(t("Evidence expiring within 30 days"), stats.evidenceExpiringSoon, "warning", "/evidence")}
          {tile(t("Expired evidence"), stats.evidenceExpired, "danger", "/evidence")}
        </div>
        <div className="lg:col-span-2">
          <p className="mb-2 text-xs font-medium text-muted">{t("Needs attention")}</p>
          {attention.length || evSoon.length ? <ul className="space-y-1.5 text-xs">
            {attention.map((d) => <li key={d.id} className="flex items-center justify-between gap-2"><Link href={`/policies/${d.id}`} className="truncate hover:underline">{d.title} <span className="text-muted">v{d.version}</span></Link>{why(d)}</li>)}
            {evSoon.map((e) => <li key={e.id} className="flex items-center justify-between gap-2"><Link href={`/evidence/${e.id}`} className="truncate hover:underline">{e.title} <span className="text-muted">{e.system?.code ?? t("org-level")}</span></Link><Badge tone="warning">{t("Valid until")} {fmtDate(e.validUntil)}</Badge></li>)}
          </ul> : <p className="text-xs text-muted">{t("Nothing due. Documents are reminded 30 days before their review date.")}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
