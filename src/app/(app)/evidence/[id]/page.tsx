import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, toneForStatus } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import { RenderBlock } from "@/components/domain/report-renderer";
import { enumLabel, fmtDate } from "@/lib/utils";
import { linkEvidenceAction, setEvidenceStatusAction } from "../actions";

export default async function EvidenceDetail(props: PageProps<"/evidence/[id]">) {
  const user = await requireUser();
  const { id } = await props.params;
  const e = await db.evidence.findFirst({ where: { id, orgId: user.orgId }, include: { system: true, run: true, createdBy: true, links: { include: { control: { include: { requirements: { include: { requirement: { include: { framework: true } } } } } }, requirement: { include: { framework: true } } } } } });
  if (!e) notFound();
  const controls = await db.control.findMany({ orderBy: { sortOrder: "asc" } });
  const content = e.content as { category?: string; metrics?: { name: string; value: number; threshold: number; direction: string; verdict: string; category: string; unit?: string; sampleSize?: number }[]; verdict?: string; reportId?: string } | null;
  return (
    <>
      <PageHeader title={e.title} crumbs={[{ label: "Evidence Center", href: "/evidence" }, { label: e.title }]} description={e.description ?? undefined} actions={<form action={async (fd) => { "use server"; await setEvidenceStatusAction(id, String(fd.get("status")) as "VALID"); }} className="flex items-center gap-2"><Select name="status" defaultValue={e.status} className="w-32">{["DRAFT", "VALID", "EXPIRED", "SUPERSEDED"].map((s) => <option key={s} value={s}>{enumLabel(s)}</option>)}</Select><Button type="submit" variant="outline">Set status</Button></form>} />
      <div className="mb-4 flex flex-wrap gap-2"><Badge>{enumLabel(e.type)}</Badge><Badge tone={e.source === "GENERATED" ? "primary" : e.source === "ATTESTATION" ? "accent" : "neutral"}>{enumLabel(e.source)}</Badge><Badge tone={toneForStatus(e.status)}>{enumLabel(e.status)}</Badge>{e.system && <Link href={`/systems/${e.systemId}?tab=evidence`}><Badge className="cursor-pointer">{e.system.code}</Badge></Link>}{e.run && <Link href={`/evaluations/${e.runId}`}><Badge className="cursor-pointer">run {e.run.code}</Badge></Link>}</div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card><CardHeader><CardTitle>Record</CardTitle></CardHeader><CardContent><dl className="space-y-1.5 text-sm">{[["Created", fmtDate(e.createdAt, true)], ["Created by", e.createdBy?.name ?? "system"], ["Valid from", fmtDate(e.validFrom)], ["Valid until", fmtDate(e.validUntil)], ["File", e.fileName ?? "—"], ["MIME", e.mimeType ?? "—"], ["SHA-256", e.sha256 ? e.sha256.slice(0, 24) + "…" : "—"]].map(([k, v]) => <div key={k as string} className="flex justify-between gap-2 border-b border-border/60 pb-1"><dt className="text-muted">{k}</dt><dd className="truncate text-right">{v}</dd></div>)}</dl>{e.fileUrl && <a href={e.fileUrl} target="_blank" className="mt-3 inline-block"><Button variant="outline" size="sm">Open file</Button></a>}{content?.reportId && <Link href={`/reports/${content.reportId}`} className="mt-3 inline-block"><Button variant="outline" size="sm">Open report</Button></Link>}</CardContent></Card>
        <Card className="lg:col-span-2"><CardHeader><CardTitle>Traceability</CardTitle><CardDescription>Controls and requirements this evidence satisfies — reused automatically in each framework&apos;s evidence pack.</CardDescription></CardHeader><CardContent>
          <ul className="space-y-2 text-sm">{e.links.map((l) => <li key={l.id} className="rounded-md border border-border px-3 py-2">{l.control ? <><div className="font-medium"><span className="font-mono text-xs text-muted">{l.control.code}</span> {l.control.name}</div><div className="text-[11px] text-muted">{l.control.requirements.map((r) => `${enumLabel(r.requirement.framework.code)} ${r.requirement.ref}`).join(" · ")}</div></> : l.requirement ? <div className="font-medium">{enumLabel(l.requirement.framework.code)} {l.requirement.ref} — {l.requirement.title}</div> : null}</li>)}{e.links.length === 0 && <li className="text-muted">Not linked yet.</li>}</ul>
          <form action={linkEvidenceAction.bind(null, e.id)} className="mt-3 flex items-center gap-2"><Select name="controlId" className="w-80"><option value="">Link to control…</option>{controls.map((c) => <option key={c.id} value={c.id}>{c.code} {c.name}</option>)}</Select><Button type="submit" size="sm" variant="outline">Link</Button></form>
        </CardContent></Card>
        {content?.metrics && <Card className="lg:col-span-3"><CardHeader><CardTitle>Test-derived content</CardTitle><CardDescription>Category {content.category} · verdict {content.verdict}</CardDescription></CardHeader><CardContent><RenderBlock block={{ type: "metrics", items: content.metrics.map((m) => ({ name: m.name, value: m.unit === "ms" ? `${Math.round(m.value)} ms` : m.unit === "score" ? m.value.toFixed(2) : `${(m.value * 100).toFixed(1)}%`, threshold: `${m.direction === "lower" ? "≤" : "≥"} ${m.unit === "ms" ? `${m.threshold} ms` : m.unit === "score" ? m.threshold : `${Math.round(m.threshold * 100)}%`}`, verdict: m.verdict, category: enumLabel(m.category), sampleSize: m.sampleSize })) }} /></CardContent></Card>}
      </div>
    </>
  );
}
