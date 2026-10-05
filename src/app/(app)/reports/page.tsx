import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser, userCan } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge, toneForStatus } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { fmtDate} from "@/lib/utils";
import { getI18n } from "@/lib/i18n/server";
import { LOCALE_META, toLocale } from "@/lib/i18n/dict";

export const metadata = { title: "Reports & Packs" };

const GROUPS: [string, string[]][] = [["Evaluation & verification", ["EVALUATION_REPORT", "VERIFICATION_REPORT", "NIST_ARIA_EVALUATION_REPORT"]], ["Regulatory evidence packs", ["ISO_42001_EVIDENCE_PACK", "EU_AI_ACT_EVIDENCE_PACK", "NIST_AI_RMF_EVIDENCE_PACK", "KR_AI_BASIC_ACT_EVIDENCE_PACK"]], ["Living records", ["AI_PASSPORT"]]];

export default async function ReportsPage() {
  const { t, L } = await getI18n();
  const user = await requireUser();
  const reports = await db.report.findMany({ where: { orgId: user.orgId }, orderBy: { createdAt: "desc" }, include: { system: true, createdBy: true, approver: true } });
  return (
    <>
      <PageHeader title={t("Reports & Evidence Packs")} description={t("Evaluation reports, formal verification (test) reports with tester/reviewer/approver sign-off, NIST ARIA worksheet reports, framework evidence packs (ISO/IEC 42001, EU AI Act, NIST AI RMF, KR AI Basic Act) and the living AI Passport. Reports are versioned; issuing one supersedes the previous version.")} actions={userCan(user, "reports.generate") && <Link href="/reports/new"><Button><Plus className="h-4 w-4" /> {t("Generate")}</Button></Link>} />
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">{GROUPS.map(([g, types]) => <Card key={g}><CardContent className="pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted">{t(g)}</p><ul className="mt-2 space-y-1 text-sm">{types.map((t) => <li key={t} className="flex items-center justify-between"><span>{L(t)}</span><span className="tabular-nums text-muted">{reports.filter((r) => r.type === t).length}</span></li>)}</ul></CardContent></Card>)}</div>
      <div className="rounded-lg border border-border bg-surface"><Table><THead><TR><TH>{t("Code")}</TH><TH>{t("Report")}</TH><TH>{t("System")}</TH><TH>{t("Version")}</TH><TH>{t("Language")}</TH><TH>{t("Status")}</TH><TH>{t("Created")}</TH><TH>{t("Approver")}</TH><TH>{t("Issued")}</TH></TR></THead><TBody>
        {reports.map((r) => <TR key={r.id}><TD className="font-mono text-xs text-muted">{r.code}</TD><TD><Link href={`/reports/${r.id}`} className="font-medium hover:underline">{L(r.type)}</Link><div className="text-xs text-muted">{r.title}</div></TD><TD className="text-xs">{r.system.code}</TD><TD>v{r.version}</TD><TD className="text-xs">{LOCALE_META[toLocale(r.language)].short}</TD><TD><Badge tone={toneForStatus(r.status)}>{L(r.status)}</Badge></TD><TD className="text-xs text-muted">{fmtDate(r.createdAt)} · {r.createdBy?.name}</TD><TD className="text-xs">{r.approver?.name ?? "—"}</TD><TD className="text-xs text-muted">{fmtDate(r.issuedAt)}</TD></TR>)}
      </TBody></Table></div>
    </>
  );
}
