import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { getI18n } from "@/lib/i18n/server";
import { localizeControl, localizeFramework } from "@/lib/i18n/content";


export const metadata = { title: "Frameworks & Controls" };

export default async function FrameworksPage() {
  const { locale, t, L } = await getI18n();
  const user = await requireUser();
  const frameworks = (await db.framework.findMany({ include: { requirements: { include: { controls: true } } } })).map((f) => localizeFramework(locale, f));
  const controls = (await db.control.findMany({ orderBy: { sortOrder: "asc" }, include: { requirements: { include: { requirement: { include: { framework: true } } } }, testMethods: { include: { testMethod: true } }, impls: { where: { system: { orgId: user.orgId } } } } })).map((c) => localizeControl(locale, c));
  const systemCount = await db.aiSystem.count({ where: { orgId: user.orgId } });
  return (
    <>
      <PageHeader title={t("Frameworks & Controls")} description={t("Requirement libraries for ISO/IEC 42001, EU AI Act, NIST AI RMF, NIST ARIA and the Korea AI Basic Act, harmonised into 28 controls. One control, one piece of evidence, many frameworks (cross-framework mapping).")} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {frameworks.map((f) => { const reqs = f.requirements.filter((r) => r.description || r.controls.length); const mapped = reqs.filter((r) => r.controls.length).length; return (
          <Link key={f.id} href={`/frameworks/${f.code}`}><Card className="h-full transition-colors hover:bg-surface-2/50"><CardHeader><CardTitle>{L(f.code)}</CardTitle><CardDescription className="line-clamp-3">{f.name}</CardDescription></CardHeader><CardContent><p className="text-2xl font-semibold tabular-nums">{reqs.length}<span className="ml-1 text-xs font-normal text-muted">{t("requirements")}</span></p><p className="mt-1 text-xs text-muted">{mapped} {t("mapped to harmonized controls")}</p><Progress value={reqs.length ? (mapped / reqs.length) * 100 : 0} className="mt-2" /><p className="mt-2 text-[11px] text-muted">{f.version}</p></CardContent></Card></Link>
        ); })}
      </div>
      <Card className="mt-6"><CardHeader><CardTitle>{t("Harmonized control library (HC-01 … HC-28)")}</CardTitle><CardDescription>{t("Implementation status aggregated across your systems.")} ({systemCount}) {t("Controls backed by test methods are verified automatically from evaluation runs; the rest are documentary (policy, procedure, attestation).")}</CardDescription></CardHeader><CardContent className="px-0 pb-0">
        <Table><THead><TR><TH>{t("Control")}</TH><TH>{t("Category")}</TH><TH>{t("ISO/IEC 42001")}</TH><TH>{t("EU AI Act")}</TH><TH>{t("NIST AI RMF")}</TH><TH>{t("KR Basic Act")}</TH><TH>{t("Test methods")}</TH><TH>{t("Verified / systems")}</TH></TR></THead><TBody>
          {controls.map((c) => { const by = (code: string) => c.requirements.filter((r) => r.requirement.framework.code === code).map((r) => r.requirement.ref); const verified = c.impls.filter((i) => i.status === "VERIFIED" || i.status === "IMPLEMENTED").length; return (
            <TR key={c.id}><TD><div className="font-medium"><span className="font-mono text-xs text-muted">{c.code}</span> {c.name}</div>{c.testHint && <div className="text-[11px] text-muted">{t("Tests")}: {c.testHint}</div>}</TD><TD><Badge>{c.category}</Badge></TD><TD className="text-xs">{by("ISO_42001").join(", ") || "—"}</TD><TD className="text-xs">{by("EU_AI_ACT").join(", ") || "—"}</TD><TD className="text-xs">{by("NIST_AI_RMF").join(", ") || "—"}</TD><TD className="text-xs">{by("KR_AI_BASIC_ACT").join(", ") || "—"}</TD><TD className="text-xs">{c.testMethods.map((t) => <Link key={t.testMethodId} href={`/library/${t.testMethod.code}`} className="mr-1 text-primary hover:underline">{t.testMethod.code}</Link>)}{c.testMethods.length === 0 && <span className="text-muted">{t("documentary")}</span>}</TD><TD><div className="flex items-center gap-2"><Progress value={systemCount ? (verified / systemCount) * 100 : 0} className="w-24" tone={verified === systemCount && systemCount ? "success" : "primary"} /><span className="text-xs tabular-nums text-muted">{verified}/{systemCount}</span></div></TD></TR>
          ); })}
        </TBody></Table>
      </CardContent></Card>
    </>
  );
}
