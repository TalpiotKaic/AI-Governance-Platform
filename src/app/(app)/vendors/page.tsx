import { Suspense } from "react";
import Link from "next/link";
import { requireUser, userCan } from "@/lib/auth";
import { db } from "@/lib/db";
import { getI18n } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { deleteDatasetAction, deleteVendorAction, saveDatasetAction, saveVendorAction } from "./actions";

export const metadata = { title: "Vendors & Datasets" };

export default async function VendorsPage(props: PageProps<"/vendors">) {
  const { t } = await getI18n();
  const user = await requireUser();
  const sp = await props.searchParams;
  const tab = sp.tab === "datasets" ? "datasets" : "vendors";
  const canWrite = userCan(user, "systems.write");
  const [vendors, datasets] = await Promise.all([
    db.vendor.findMany({ where: { orgId: user.orgId }, orderBy: { name: "asc" }, include: { systems: { include: { system: { select: { id: true, code: true, name: true } } } } } }),
    db.dataset.findMany({ where: { orgId: user.orgId }, orderBy: { name: "asc" }, include: { systems: { include: { system: { select: { id: true, code: true, name: true } } } } } }),
  ]);
  const riskTone = (r: number | null) => (r === null ? "neutral" : r >= 60 ? "danger" : r >= 35 ? "warning" : "success");
  return (
    <>
      <PageHeader title={t("Vendors & Datasets")} description={t("Third-party providers (model APIs, hosting, tool providers) and the datasets your AI systems train on, retrieve from or evaluate against. Link them to systems from the intake form or the system page; they appear in the AI Passport and feed the vendor-risk and data-protection evidence.")} />
      <Suspense><Tabs tabs={[{ key: "vendors", label: "Vendors", count: vendors.length }, { key: "datasets", label: "Datasets", count: datasets.length }]} /></Suspense>

      {tab === "vendors" && (
        <div className="space-y-4">
          {canWrite && <Card><CardHeader><CardTitle>{t("Add vendor")}</CardTitle><CardDescription>{t("Risk score 0–100 (vendor due-diligence result); certifications comma-separated (ISO 27001, SOC 2…).")}</CardDescription></CardHeader><CardContent>
            <form action={saveVendorAction.bind(null, null)} className="grid grid-cols-1 gap-3 md:grid-cols-6">
              <Field label={t("Name")} className="md:col-span-2"><Input name="name" required /></Field>
              <Field label={t("Service type")}><Input name="serviceType" placeholder={t("Foundation model API, Cloud hosting, SaaS AI…")} /></Field>
              <Field label={t("Country")}><Input name="country" placeholder="US, KR, EU…" /></Field>
              <Field label={t("Risk score")}><Input name="riskScore" type="number" min={0} max={100} step={1} /></Field>
              <Field label={t("Data sensitivity")}><Input name="dataSensitivity" placeholder={t("What data the vendor sees")} /></Field>
              <Field label={t("Certifications")} className="md:col-span-3"><Input name="certifications" placeholder="ISO 27001, SOC 2 Type II, ISO 42001" /></Field>
              <Field label={t("Notes")} className="md:col-span-3"><Input name="notes" /></Field>
              <div className="flex justify-end md:col-span-6"><Button type="submit">{t("Add vendor")}</Button></div>
            </form></CardContent></Card>}
          {vendors.length === 0 && <p className="text-sm text-muted">{t("No vendors registered yet.")}</p>}
          {vendors.map((v) => (
            <Card key={v.id}><CardContent className="pt-5">
              <form action={saveVendorAction.bind(null, v.id)} className="grid grid-cols-1 gap-3 md:grid-cols-6">
                <div className="flex flex-wrap items-center justify-between gap-2 md:col-span-6">
                  <div className="flex flex-wrap items-center gap-2"><span className="font-medium">{v.name}</span><Badge tone={riskTone(v.riskScore)}>{t("Risk")} {v.riskScore ?? "—"}/100</Badge>{v.certifications.map((c) => <Badge key={c}>{c}</Badge>)}</div>
                  <div className="text-xs text-muted">{v.systems.length ? <>{t("Used by")} {v.systems.map((l) => <Link key={l.systemId} href={`/systems/${l.system.id}`} className="ml-1 text-primary hover:underline">{l.system.code}</Link>)}</> : t("Not linked to any system")}</div>
                </div>
                {canWrite ? <>
                  <Field label={t("Name")} className="md:col-span-2"><Input name="name" defaultValue={v.name} required /></Field>
                  <Field label={t("Service type")}><Input name="serviceType" defaultValue={v.serviceType ?? ""} /></Field>
                  <Field label={t("Country")}><Input name="country" defaultValue={v.country ?? ""} /></Field>
                  <Field label={t("Risk score")}><Input name="riskScore" type="number" min={0} max={100} step={1} defaultValue={v.riskScore ?? ""} /></Field>
                  <Field label={t("Data sensitivity")}><Input name="dataSensitivity" defaultValue={v.dataSensitivity ?? ""} /></Field>
                  <Field label={t("Certifications")} className="md:col-span-3"><Input name="certifications" defaultValue={v.certifications.join(", ")} /></Field>
                  <Field label={t("Notes")} className="md:col-span-3"><Input name="notes" defaultValue={v.notes ?? ""} /></Field>
                  <div className="flex justify-end gap-2 md:col-span-6"><ConfirmButton variant="ghost" size="sm" formAction={deleteVendorAction.bind(null, v.id)} message={t("Delete this vendor? Links to systems are removed as well.")}>{t("Delete")}</ConfirmButton><Button type="submit" size="sm" variant="outline">{t("Save")}</Button></div>
                </> : <p className="text-sm text-muted md:col-span-6">{[v.serviceType, v.country, v.dataSensitivity, v.notes].filter(Boolean).join(" · ") || "—"}</p>}
              </form>
            </CardContent></Card>
          ))}
        </div>
      )}

      {tab === "datasets" && (
        <div className="space-y-4">
          {canWrite && <Card><CardHeader><CardTitle>{t("Add dataset")}</CardTitle><CardDescription>{t("Sensitivity: public / internal / confidential / restricted. Mark PII so privacy risks and DPIA evidence are linked correctly.")}</CardDescription></CardHeader><CardContent>
            <form action={saveDatasetAction.bind(null, null)} className="grid grid-cols-1 gap-3 md:grid-cols-6">
              <Field label={t("Name")} className="md:col-span-2"><Input name="name" required /></Field>
              <Field label={t("Version")}><Input name="version" /></Field>
              <Field label={t("Source")}><Input name="source" placeholder={t("CRM export, public corpus, vendor…")} /></Field>
              <Field label={t("Sensitivity")}><Input name="sensitivity" list="sens-list" placeholder="internal" /></Field>
              <Field label={t("Record count")}><Input name="recordCount" type="number" min={0} /></Field>
              <Field label={t("Description")} className="md:col-span-5"><Textarea name="description" rows={2} /></Field>
              <div className="flex items-end pb-2"><Checkbox name="containsPii" label={t("Contains PII")} /></div>
              <div className="flex justify-end md:col-span-6"><Button type="submit">{t("Add dataset")}</Button></div>
            </form></CardContent></Card>}
          <datalist id="sens-list"><option value="public" /><option value="internal" /><option value="confidential" /><option value="restricted" /></datalist>
          {datasets.length === 0 && <p className="text-sm text-muted">{t("No datasets registered yet.")}</p>}
          {datasets.map((d) => (
            <Card key={d.id}><CardContent className="pt-5">
              <form action={saveDatasetAction.bind(null, d.id)} className="grid grid-cols-1 gap-3 md:grid-cols-6">
                <div className="flex flex-wrap items-center justify-between gap-2 md:col-span-6">
                  <div className="flex flex-wrap items-center gap-2"><span className="font-medium">{d.name}</span>{d.version && <Badge>{d.version}</Badge>}{d.containsPii && <Badge tone="warning">{t("PII")}</Badge>}{d.sensitivity && <Badge tone="info">{d.sensitivity}</Badge>}</div>
                  <div className="text-xs text-muted">{d.systems.length ? <>{t("Used by")} {d.systems.map((l) => <Link key={l.systemId} href={`/systems/${l.system.id}`} className="ml-1 text-primary hover:underline">{l.system.code}</Link>)}</> : t("Not linked to any system")}</div>
                </div>
                {canWrite ? <>
                  <Field label={t("Name")} className="md:col-span-2"><Input name="name" defaultValue={d.name} required /></Field>
                  <Field label={t("Version")}><Input name="version" defaultValue={d.version ?? ""} /></Field>
                  <Field label={t("Source")}><Input name="source" defaultValue={d.source ?? ""} /></Field>
                  <Field label={t("Sensitivity")}><Input name="sensitivity" list="sens-list" defaultValue={d.sensitivity ?? ""} /></Field>
                  <Field label={t("Record count")}><Input name="recordCount" type="number" min={0} defaultValue={d.recordCount ?? ""} /></Field>
                  <Field label={t("Description")} className="md:col-span-5"><Textarea name="description" rows={2} defaultValue={d.description ?? ""} /></Field>
                  <div className="flex items-end pb-2"><Checkbox name="containsPii" label={t("Contains PII")} defaultChecked={d.containsPii} /></div>
                  <div className="flex justify-end gap-2 md:col-span-6"><ConfirmButton variant="ghost" size="sm" formAction={deleteDatasetAction.bind(null, d.id)} message={t("Delete this dataset? Links to systems are removed as well.")}>{t("Delete")}</ConfirmButton><Button type="submit" size="sm" variant="outline">{t("Save")}</Button></div>
                </> : <p className="text-sm text-muted md:col-span-6">{[d.source, d.description].filter(Boolean).join(" · ") || "—"}</p>}
              </form>
            </CardContent></Card>
          ))}
        </div>
      )}
    </>
  );
}
