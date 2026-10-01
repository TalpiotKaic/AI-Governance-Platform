import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge, toneForStatus } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { SeverityBadge } from "@/components/domain/verdict";
import { enumLabel, fmtDate } from "@/lib/utils";
import { updateIncidentAction } from "./actions";

export const metadata = { title: "Incidents" };

export default async function IncidentsPage() {
  const user = await requireUser();
  const incidents = await db.incident.findMany({ where: { orgId: user.orgId }, orderBy: { reportedAt: "desc" }, include: { system: true } });
  return (
    <>
      <PageHeader title="Incidents & post-market monitoring" description="Operational AI incidents (bias, hallucination, privacy, safety, security). Reporting an incident registers an EXPOSURE risk and a re-evaluation task; serious incidents are flagged for EU AI Act Art. 73 reporting clocks and KR AI Basic Act 제32조 response." actions={<Link href="/incidents/new"><Button><Plus className="h-4 w-4" /> Report incident</Button></Link>} />
      <div className="space-y-3">{incidents.map((i) => <Card key={i.id}><CardContent className="pt-4"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs text-muted">{i.code}</span><SeverityBadge severity={i.severity} /><Badge tone={toneForStatus(i.status)}>{enumLabel(i.status)}</Badge>{i.harmCategory && <Badge>{i.harmCategory}</Badge>}{i.seriousIncident && <Badge tone="danger">Serious incident (Art. 73)</Badge>}<span className="font-medium">{i.title}</span><span className="text-xs text-muted">· {i.system?.code ?? "org"} · reported {fmtDate(i.reportedAt)}{i.resolvedAt ? ` · resolved ${fmtDate(i.resolvedAt)}` : ""}</span></div>
        {i.description && <p className="mt-2 text-sm text-muted">{i.description}</p>}
        <form action={updateIncidentAction.bind(null, i.id)} className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-[140px_1fr_1fr_auto]"><Select name="status" defaultValue={i.status} className="h-8 text-xs">{["REPORTED", "INVESTIGATING", "MITIGATED", "CLOSED"].map((s) => <option key={s} value={s}>{enumLabel(s)}</option>)}</Select><Input name="rootCause" defaultValue={i.rootCause ?? ""} placeholder="Root cause" className="h-8 text-xs" /><Input name="actions" defaultValue={i.actions ?? ""} placeholder="Corrective actions" className="h-8 text-xs" /><Button size="sm" type="submit" variant="outline">Update</Button></form>
      </CardContent></Card>)}{incidents.length === 0 && <p className="text-sm text-muted">No incidents recorded.</p>}</div>
    </>
  );
}
