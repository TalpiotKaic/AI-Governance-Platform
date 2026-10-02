import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge, toneForStatus } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Select } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { getI18n } from "@/lib/i18n/server";

import type { FrameworkCode } from "@/generated/prisma/client";
import { FRAMEWORK_PACK_TYPE } from "@/lib/reports/service";

export default async function FrameworkDetailPage(props: PageProps<"/frameworks/[code]">) {
  const { t, L } = await getI18n();
  const user = await requireUser();
  const { code } = await props.params;
  const sp = await props.searchParams;
  const fw = await db.framework.findUnique({ where: { code: code as FrameworkCode }, include: { requirements: { orderBy: { sortOrder: "asc" }, include: { controls: { include: { control: true } } } } } });
  if (!fw) notFound();
  const systems = await db.aiSystem.findMany({ where: { orgId: user.orgId }, orderBy: { code: "asc" } });
  const systemId = typeof sp.systemId === "string" ? sp.systemId : systems[0]?.id;
  const impls = systemId ? await db.controlImplementation.findMany({ where: { systemId } }) : [];
  const evidenceLinks = systemId ? await db.evidenceLink.findMany({ where: { evidence: { systemId, status: "VALID" } }, select: { controlId: true, requirementId: true } }) : [];
  const implByControl = new Map(impls.map((i) => [i.controlId, i.status]));
  const evCountByControl = new Map<string, number>();
  for (const l of evidenceLinks) if (l.controlId) evCountByControl.set(l.controlId, (evCountByControl.get(l.controlId) ?? 0) + 1);
  const categories = [...new Set(fw.requirements.map((r) => r.category ?? "General"))];
  let total = 0, covered = 0, partial = 0;
  const statusFor = (r: (typeof fw.requirements)[number]) => {
    const cs = r.controls.map((rc) => rc.control);
    if (!r.description && cs.length === 0) return null;
    total++;
    if (!cs.length) return "UNMAPPED";
    const sts = cs.map((c) => implByControl.get(c.id) ?? "NOT_STARTED");
    const ev = cs.reduce((n, c) => n + (evCountByControl.get(c.id) ?? 0), 0);
    const ok = sts.every((s) => s === "VERIFIED" || s === "IMPLEMENTED" || s === "NOT_APPLICABLE");
    if (ok && ev > 0) { covered++; return "COVERED"; }
    if (sts.some((s) => s !== "NOT_STARTED") || ev > 0) { partial++; return "PARTIAL"; }
    return "GAP";
  };
  const rows = fw.requirements.map((r) => ({ r, status: statusFor(r) }));
  const packType = FRAMEWORK_PACK_TYPE[fw.code];
  return (
    <>
      <PageHeader title={L(fw.code)} crumbs={[{ label: "Frameworks & Controls", href: "/frameworks" }, { label: L(fw.code) }]} description={fw.description ?? undefined}
        actions={<>{packType && systemId && <Link href={`/reports/new?systemId=${systemId}&type=${packType}`}><Button>{t("Generate evidence pack")}</Button></Link>}</>} />
      <Card className="mb-4"><CardContent className="flex flex-col gap-3 pt-5 md:flex-row md:items-center md:justify-between">
        <form className="flex items-center gap-2 text-sm"><span className="text-muted">{t("Coverage for system:")}</span><Select name="systemId" defaultValue={systemId} className="w-72">{systems.map((s) => <option key={s.id} value={s.id}>{s.code} · {s.name}</option>)}</Select><Button type="submit" variant="outline" size="sm">{t("Apply")}</Button></form>
        <div className="flex items-center gap-3 text-sm"><Progress value={total ? (covered / total) * 100 : 0} className="w-48" tone={covered / Math.max(1, total) >= 0.8 ? "success" : "primary"} /><span className="tabular-nums">{covered}/{total} covered</span><Badge tone="warning">{partial} partial</Badge><Badge tone="danger">{total - covered - partial} gaps</Badge></div>
      </CardContent></Card>
      {categories.map((cat) => { const items = rows.filter(({ r }) => (r.category ?? "General") === cat); return (
        <Card key={cat} className="mb-4"><CardHeader><CardTitle>{cat}</CardTitle><CardDescription>{items.filter((i) => i.status).length} assessable requirements</CardDescription></CardHeader><CardContent className="px-0 pb-0">
          <Table><THead><TR><TH className="w-28">{t("Ref")}</TH><TH>{t("Requirement")}</TH><TH>{t("Harmonized controls")}</TH><TH>{t("Expected evidence / tests")}</TH><TH>{t("Status")}</TH></TR></THead><TBody>
            {items.map(({ r, status }) => <TR key={r.id} className={status === null ? "bg-surface-2/50" : ""}><TD className="font-mono text-xs">{r.ref}</TD><TD><div className={status === null ? "font-semibold" : "font-medium"}>{r.title}</div>{r.description && <div className="mt-0.5 text-xs text-muted">{r.description}</div>}</TD><TD className="text-xs">{r.controls.map((rc) => <Badge key={rc.controlId} className="mr-1 mb-1" tone={toneForStatus(implByControl.get(rc.controlId) ?? "NOT_STARTED") === "success" ? "success" : "neutral"}>{rc.control.code}</Badge>)}</TD><TD className="text-[11px] text-muted">{r.evidenceHint ?? "—"}</TD><TD>{status && <Badge tone={status === "COVERED" ? "success" : status === "PARTIAL" ? "warning" : status === "GAP" ? "danger" : "neutral"}>{L(status)}</Badge>}</TD></TR>)}
          </TBody></Table>
        </CardContent></Card>
      ); })}
    </>
  );
}
