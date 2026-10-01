import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { enumLabel } from "@/lib/utils";
import { createEvidenceAction } from "../actions";

const TYPES = ["MODEL_CARD", "AGENT_CARD", "RISK_ASSESSMENT", "IMPACT_ASSESSMENT", "DPIA", "BIAS_FAIRNESS_REPORT", "ROBUSTNESS_TEST_REPORT", "SECURITY_ASSESSMENT", "RED_TEAM_REPORT", "USER_TESTING_REPORT", "EVALUATION_METRICS", "EVALUATION_PLAN", "TEST_REPORT", "HUMAN_OVERSIGHT_PLAN", "POST_MARKET_MONITORING_PLAN", "AUDIT_REPORT", "CONFORMITY_ASSESSMENT", "POLICY_DOCUMENT", "APPROVAL_RECORD", "INCIDENT_RECORD", "TRAINING_RECORD", "OTHER"];

export default async function NewEvidencePage(props: PageProps<"/evidence/new">) {
  const user = await requireUser();
  const sp = await props.searchParams;
  const systems = await db.aiSystem.findMany({ where: { orgId: user.orgId }, orderBy: { code: "asc" } });
  const controls = await db.control.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <>
      <PageHeader title="Add evidence" crumbs={[{ label: "Evidence Center", href: "/evidence" }, { label: "New" }]} description="Upload a document or record an attestation and link it to harmonized controls so it is reused across every framework pack." />
      <Card><CardContent className="pt-5"><form action={createEvidenceAction} className="grid grid-cols-1 gap-4 md:grid-cols-2" encType="multipart/form-data">
        <Field label="Title" className="md:col-span-2"><Input name="title" required /></Field>
        <Field label="Evidence type"><Select name="type" defaultValue="POLICY_DOCUMENT">{TYPES.map((t) => <option key={t} value={t}>{enumLabel(t)}</option>)}</Select></Field>
        <Field label="Source"><Select name="source" defaultValue="UPLOADED"><option value="UPLOADED">Uploaded document</option><option value="ATTESTATION">Human attestation (no file)</option></Select></Field>
        <Field label="AI system (optional — leave blank for organisation-level evidence)"><Select name="systemId" defaultValue={typeof sp.systemId === "string" ? sp.systemId : ""}><option value="">Organisation-level</option>{systems.map((s) => <option key={s.id} value={s.id}>{s.code} · {s.name}</option>)}</Select></Field>
        <Field label="Valid until (optional)"><Input name="validUntil" type="date" /></Field>
        <Field label="Description / attestation statement" className="md:col-span-2"><Textarea name="description" /></Field>
        <Field label="File (PDF, DOCX, XLSX, images…)" className="md:col-span-2"><Input name="file" type="file" className="py-1.5" /></Field>
        <div className="md:col-span-2"><p className="mb-1 text-xs font-medium text-muted">Link to harmonized controls</p><div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">{controls.map((c) => <label key={c.id} className="flex items-center gap-2 rounded border border-border px-2 py-1 text-xs"><input type="checkbox" name="controlIds" value={c.id} className="accent-[var(--primary)]" /><span><span className="font-mono text-muted">{c.code}</span> {c.name}</span></label>)}</div></div>
        <div className="flex justify-end md:col-span-2"><Button type="submit">Save evidence</Button></div>
      </form></CardContent></Card>
    </>
  );
}
