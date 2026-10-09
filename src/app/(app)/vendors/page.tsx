import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser, userCan } from "@/lib/auth";
import { db } from "@/lib/db";
import { getI18n } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { SENSITIVITY_LEVELS, sensitivityLabel } from "@/lib/datasets";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { deleteDatasetAction, deleteVendorAction, saveDatasetAction, saveVendorAction } from "./actions";
import { AssessmentFields } from "./assessment-fields";
import { dataProfileSummary, parseAssessment, parseDataProfile } from "@/lib/vendors/assessment";

export const metadata = { title: "Vendors & Datasets" };

export default async function VendorsPage(props: PageProps<"/vendors">) {
  const { t } = await getI18n();
  const user = await requireUser();
  const sp = await props.searchParams;
  const tab = sp.tab === "datasets" ? "datasets" : "vendors";
  const editId = typeof sp.edit === "string" ? sp.edit : null;
  const adding = sp.add === "1";
  const canWrite = userCan(user, "systems.write");
  const [vendors, datasets] = await Promise.all([
    db.vendor.findMany({ where: { orgId: user.orgId }, orderBy: { name: "asc" }, include: { systems: { include: { system: { select: { id: true, code: true, name: true } } } } } }),
    db.dataset.findMany({ where: { orgId: user.orgId }, orderBy: { name: "asc" }, include: { systems: { include: { system: { select: { id: true, code: true, name: true } } } } } }),
  ]);
  const riskTone = (r: number | null) => (r === null ? "neutral" : r >= 60 ? "danger" : r >= 35 ? "warning" : "success");
  const base = `/vendors?tab=${tab}`;
  const editVendor = tab === "vendors" && editId ? vendors.find((v) => v.id === editId) : undefined;
  const editDataset = tab === "datasets" && editId ? datasets.find((d) => d.id === editId) : undefined;
  const usedBy = (links: { systemId: string; system: { id: string; code: string } }[]) => links.length ? links.map((l) => <Link key={l.systemId} href={`/systems/${l.system.id}`} className="mr-1 text-primary hover:underline">{l.system.code}</Link>) : <span className="text-muted">—</span>;

  return (
    <>
      <PageHeader title={t("Vendors & Datasets")} description={t("Third-party providers (model APIs, hosting, tool providers) and the datasets your AI systems train on, retrieve from or evaluate against. Link them to systems from the intake form or the system page; they appear in the AI Passport and feed the vendor-risk and data-protection evidence.")}
        actions={canWrite && !adding && !editId ? <Link href={`${base}&add=1`}><Button><Plus className="h-4 w-4" /> {tab === "vendors" ? t("Add vendor") : t("Add dataset")}</Button></Link> : undefined} />
      <Suspense><Tabs tabs={[{ key: "vendors", label: "Vendors", count: vendors.length }, { key: "datasets", label: "Datasets", count: datasets.length }]} /></Suspense>

      {tab === "vendors" && (
        <div className="space-y-4">
          {(adding || editVendor) && canWrite && (() => { const v = editVendor; return (
            <Card><CardHeader><CardTitle>{v ? `${t("Edit")}: ${v.name}` : t("Add vendor")}</CardTitle><CardDescription>{t("Fill the six-item due-diligence checklist to compute the risk score and describe the data the vendor sees; certifications comma-separated (ISO 27001, SOC 2…).")}</CardDescription></CardHeader><CardContent>
              <form action={saveVendorAction.bind(null, v?.id ?? null)} className="grid grid-cols-1 gap-3 md:grid-cols-6">
                <Field label={t("Name")} className="md:col-span-2"><Input name="name" defaultValue={v?.name ?? ""} required /></Field>
                <Field label={t("Service type")}><Input name="serviceType" defaultValue={v?.serviceType ?? ""} placeholder={t("Foundation model API, Cloud hosting, SaaS AI…")} /></Field>
                <Field label={t("Country")}><Input name="country" defaultValue={v?.country ?? ""} placeholder="US, KR, EU…" /></Field>
                <Field label={t("Certifications")} className="md:col-span-2"><Input name="certifications" defaultValue={v?.certifications.join(", ") ?? ""} placeholder="ISO 27001, SOC 2 Type II, ISO 42001" /></Field>
                <Field label={t("Notes")} className="md:col-span-6"><Input name="notes" defaultValue={v?.notes ?? ""} /></Field>
                <AssessmentFields assessment={v ? parseAssessment(v.assessment) : null} profile={v ? parseDataProfile(v.dataProfile) : null} currentScore={v?.riskScore ?? null} />
                <div className="flex flex-wrap items-center justify-between gap-2 md:col-span-6">
                  <div>{v && <ConfirmButton variant="ghost" size="sm" formAction={deleteVendorAction.bind(null, v.id)} message={t("Delete this vendor? Links to systems are removed as well.")}>{t("Delete")}</ConfirmButton>}</div>
                  <div className="flex gap-2"><Link href={base}><Button type="button" variant="ghost">{t("Cancel")}</Button></Link><Button type="submit">{v ? t("Save") : t("Add vendor")}</Button></div>
                </div>
              </form>
            </CardContent></Card>
          ); })()}
          <Card><CardContent className="px-0 pb-0 pt-0">
            {vendors.length === 0 ? <p className="p-4 text-sm text-muted">{t("No vendors registered yet.")}</p> : (
              <Table><THead><TR><TH>{t("Name")}</TH><TH>{t("Service type")}</TH><TH>{t("Country")}</TH><TH>{t("Risk")}</TH><TH>{t("Data exposed")}</TH><TH>{t("Certifications")}</TH><TH>{t("Used by")}</TH>{canWrite && <TH></TH>}</TR></THead><TBody>
                {vendors.map((v) => { const prof = parseDataProfile(v.dataProfile); const line = prof ? dataProfileSummary(prof, t) : v.dataSensitivity; return (
                  <TR key={v.id} className={editId === v.id ? "bg-primary-soft/30" : ""}>
                    <TD className="font-medium">{v.name}</TD>
                    <TD className="text-xs text-muted">{v.serviceType ?? "—"}</TD>
                    <TD className="text-xs text-muted">{v.country ?? "—"}</TD>
                    <TD><Badge tone={riskTone(v.riskScore)}>{v.riskScore ?? "—"}/100</Badge>{v.assessedAt ? <div className="mt-0.5 text-[10px] text-muted">{t("assessed")} {v.assessedAt.toISOString().slice(0, 10)}</div> : v.riskScore !== null ? <div className="mt-0.5 text-[10px] text-muted">{t("manual")}</div> : null}</TD>
                    <TD className="max-w-xs text-xs text-muted"><span className="line-clamp-2" title={line ?? ""}>{line || "—"}</span></TD>
                    <TD className="text-xs">{v.certifications.length ? v.certifications.map((c) => <Badge key={c} className="mr-1 mb-1">{c}</Badge>) : <span className="text-muted">—</span>}</TD>
                    <TD className="text-xs">{usedBy(v.systems)}</TD>
                    {canWrite && <TD className="text-right"><Link href={`${base}&edit=${v.id}`} className="text-xs text-primary hover:underline">{t("Edit")}</Link></TD>}
                  </TR>
                ); })}
              </TBody></Table>
            )}
          </CardContent></Card>
        </div>
      )}

      {tab === "datasets" && (
        <div className="space-y-4">
          {(adding || editDataset) && canWrite && (() => { const d = editDataset; return (
            <Card><CardHeader><CardTitle>{d ? `${t("Edit")}: ${d.name}` : t("Add dataset")}</CardTitle><CardDescription>{t("Sensitivity: public / internal / confidential / restricted. Mark PII so privacy risks and DPIA evidence are linked correctly.")}</CardDescription></CardHeader><CardContent>
              <form action={saveDatasetAction.bind(null, d?.id ?? null)} className="grid grid-cols-1 gap-3 md:grid-cols-6">
                <Field label={t("Name")} className="md:col-span-2"><Input name="name" defaultValue={d?.name ?? ""} required /></Field>
                <Field label={t("Version")}><Input name="version" defaultValue={d?.version ?? ""} /></Field>
                <Field label={t("Source")}><Input name="source" defaultValue={d?.source ?? ""} placeholder={t("CRM export, public corpus, vendor…")} /></Field>
                <Field label={t("Sensitivity")}><Select name="sensitivity" defaultValue={d?.sensitivity ?? ""}><option value="">—</option>{SENSITIVITY_LEVELS.map((v) => <option key={v} value={v}>{t(v)}</option>)}</Select></Field>
                <Field label={t("Record count")}><Input name="recordCount" type="number" min={0} defaultValue={d?.recordCount ?? ""} /></Field>
                <Field label={t("Description")} className="md:col-span-5"><Textarea name="description" rows={2} defaultValue={d?.description ?? ""} /></Field>
                <div className="flex items-end pb-2"><Checkbox name="containsPii" label={t("Contains PII")} defaultChecked={d?.containsPii} /></div>
                <div className="flex flex-wrap items-center justify-between gap-2 md:col-span-6">
                  <div>{d && <ConfirmButton variant="ghost" size="sm" formAction={deleteDatasetAction.bind(null, d.id)} message={t("Delete this dataset? Links to systems are removed as well.")}>{t("Delete")}</ConfirmButton>}</div>
                  <div className="flex gap-2"><Link href={base}><Button type="button" variant="ghost">{t("Cancel")}</Button></Link><Button type="submit">{d ? t("Save") : t("Add dataset")}</Button></div>
                </div>
              </form>
            </CardContent></Card>
          ); })()}
          <Card><CardContent className="px-0 pb-0 pt-0">
            {datasets.length === 0 ? <p className="p-4 text-sm text-muted">{t("No datasets registered yet.")}</p> : (
              <Table><THead><TR><TH>{t("Name")}</TH><TH>{t("Version")}</TH><TH>{t("Source")}</TH><TH>{t("Sensitivity")}</TH><TH>{t("PII")}</TH><TH>{t("Record count")}</TH><TH>{t("Used by")}</TH>{canWrite && <TH></TH>}</TR></THead><TBody>
                {datasets.map((d) => (
                  <TR key={d.id} className={editId === d.id ? "bg-primary-soft/30" : ""}>
                    <TD><div className="font-medium">{d.name}</div>{d.description && <div className="line-clamp-1 max-w-xs text-xs text-muted">{d.description}</div>}</TD>
                    <TD className="text-xs text-muted">{d.version ?? "—"}</TD>
                    <TD className="text-xs text-muted">{d.source ?? "—"}</TD>
                    <TD>{d.sensitivity ? <Badge tone="info">{sensitivityLabel(t, d.sensitivity)}</Badge> : <span className="text-xs text-muted">—</span>}</TD>
                    <TD>{d.containsPii ? <Badge tone="warning">{t("PII")}</Badge> : <span className="text-xs text-muted">—</span>}</TD>
                    <TD className="text-xs tabular-nums text-muted">{d.recordCount?.toLocaleString() ?? "—"}</TD>
                    <TD className="text-xs">{usedBy(d.systems)}</TD>
                    {canWrite && <TD className="text-right"><Link href={`${base}&edit=${d.id}`} className="text-xs text-primary hover:underline">{t("Edit")}</Link></TD>}
                  </TR>
                ))}
              </TBody></Table>
            )}
          </CardContent></Card>
        </div>
      )}
    </>
  );
}
