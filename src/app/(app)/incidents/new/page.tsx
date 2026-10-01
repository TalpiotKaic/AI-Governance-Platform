import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { createIncidentAction } from "../actions";

export default async function NewIncidentPage() {
  const user = await requireUser();
  const systems = await db.aiSystem.findMany({ where: { orgId: user.orgId }, orderBy: { code: "asc" } });
  return (
    <>
      <PageHeader title="Report incident" crumbs={[{ label: "Incidents", href: "/incidents" }, { label: "New" }]} />
      <Card><CardContent className="pt-5"><form action={createIncidentAction} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Title" className="md:col-span-2"><Input name="title" required /></Field>
        <Field label="AI system"><Select name="systemId"><option value="">— organisation-level —</option>{systems.map((s) => <option key={s.id} value={s.id}>{s.code} · {s.name}</option>)}</Select></Field>
        <Field label="Severity"><Select name="severity" defaultValue="MEDIUM">{["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"].map((s) => <option key={s} value={s}>{s}</option>)}</Select></Field>
        <Field label="Harm category"><Select name="harmCategory" defaultValue="hallucination"><option>bias</option><option>hallucination</option><option>privacy</option><option>safety</option><option>security</option><option>financial</option><option>agent_action</option><option>other</option></Select></Field>
        <Field label="Affected persons (count)"><Input name="affectedCount" type="number" min={0} /></Field>
        <Field label="Description" className="md:col-span-2"><Textarea name="description" /></Field>
        <div className="md:col-span-2"><Checkbox name="seriousIncident" label="Serious incident — death/serious harm, critical infrastructure disruption, fundamental-rights breach, or serious property/environmental damage (EU AI Act Art. 3(49)); triggers Art. 73 reporting clocks" /></div>
        <div className="flex justify-end md:col-span-2"><Button type="submit">Report</Button></div>
      </form></CardContent></Card>
    </>
  );
}
