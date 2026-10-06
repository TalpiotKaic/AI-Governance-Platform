import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getI18n } from "@/lib/i18n/server";
import { localizeControl } from "@/lib/i18n/content";

import type { AnnotationItem, ScenarioPrompt } from "@/lib/eval/types";

export default async function MethodPage(props: PageProps<"/library/[code]">) {
  const { locale, t, L } = await getI18n();
  await requireUser();
  const { code } = await props.params;
  const sp = await props.searchParams;
  const m = await db.testMethod.findUnique({ where: { code }, include: { controls: { include: { control: { include: { requirements: { include: { requirement: { include: { framework: true } } } } } } } }, scenarios: { orderBy: { code: "asc" } } } });
  if (!m) notFound();
  const focus = typeof sp.scenario === "string" ? sp.scenario : undefined;
  return (
    <>
      <PageHeader title={`${m.code} · ${m.name}`} crumbs={[{ label: "Test Library", href: "/library" }, { label: m.code }]} description={m.description ?? undefined} />
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card><CardHeader><CardTitle>{t("Method")}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><div><Badge>{L(m.category)}</Badge> <Badge tone="info">{L(m.testingType)}</Badge></div><p><span className="text-muted">{t("Reference:")} </span>{m.standardRef}</p><p><span className="text-muted">{t("Applicable to:")} </span>{m.applicableTo.map((x) => L(x)).join(", ")}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>{t("Metrics & acceptance criteria")}</CardTitle></CardHeader><CardContent><ul className="space-y-1 text-sm">{(m.metrics as { key: string; name: string; direction: string; threshold: number; unit?: string; aggregate?: string }[]).map((x) => <li key={x.key} className="flex items-center justify-between rounded border border-border px-2 py-1"><span>{x.name}<span className="ml-1 text-[11px] text-muted">({x.aggregate ?? "rate"})</span></span><span className="font-mono text-xs">{x.direction === "lower" ? "≤" : "≥"} {x.unit === "rate" ? `${Math.round(x.threshold * 100)}%` : x.unit === "ms" ? `${x.threshold} ms` : x.threshold}</span></li>)}</ul></CardContent></Card>
        <Card><CardHeader><CardTitle>{t("Control & requirement traceability")}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">{m.controls.map((c) => <div key={c.controlId} className="rounded border border-border px-2 py-1.5"><div className="font-medium"><span className="font-mono text-xs text-muted">{c.control.code}</span> {localizeControl(locale, c.control).name}</div><div className="text-[11px] text-muted">{c.control.requirements.map((r) => `${L(r.requirement.framework.code)} ${r.requirement.ref}`).join(" · ")}</div></div>)}</CardContent></Card>
      </div>
      {m.judgeRubric && m.judgeRubric !== "n/a" && <Card className="mb-4"><CardHeader><CardTitle>{t("LLM-as-judge rubric")}</CardTitle></CardHeader><CardContent className="text-sm">{m.judgeRubric}</CardContent></Card>}
      {m.scenarios.map((s) => { const prompts = s.prompts as unknown as ScenarioPrompt[]; const items = s.annotationSchema as unknown as AnnotationItem[]; const q = s.questionnaire as { key: string; question: string }[]; return (
        <Card key={s.id} id={s.code} className={`mb-4 ${focus === s.code ? "ring-2 ring-ring" : ""}`}><CardHeader><CardTitle>{s.code} · {s.name}</CardTitle><CardDescription>{s.sector} · {s.useCase} · Target concept: {s.targetConcept}{s.tactic ? ` · Tactic: ${s.tactic}` : ""}</CardDescription></CardHeader><CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{t("Description & instructions")}</p><p className="text-sm">{s.description}</p><p className="mt-1 text-sm text-muted">{s.instructions}</p>
            <p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-muted">Annotation schema ({items.length})</p><ul className="space-y-1 text-xs">{items.map((it) => <li key={it.key} className="rounded border border-border px-2 py-1"><span className="font-mono text-muted">{it.key}</span> — {it.question} <Badge className="ml-1">{it.type}{it.options ? `: ${it.options.join("/")}` : ""}</Badge></li>)}</ul>
            {q.length > 0 && <><p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-muted">{t("Questionnaire")}</p><ul className="list-disc pl-4 text-xs">{q.map((x) => <li key={x.key}>{x.question}</li>)}</ul></>}</div>
          <div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Prompt set ({prompts.length})</p><ul className="space-y-1.5 text-xs">{prompts.map((p) => <li key={p.id} className="rounded border border-border px-2 py-1.5"><div className="mb-0.5 flex flex-wrap gap-1 text-[10px] text-muted"><span className="font-mono">{p.id}</span>{p.tags?.map((t) => <Badge key={t}>{t}</Badge>)}{p.pairWith && <Badge tone="accent">pair: {p.pairWith}</Badge>}{p.expectedTool !== undefined && <Badge tone="info">expect: {p.expectedTool ?? "no tool"}</Badge>}{p.forbiddenTools?.length ? <Badge tone="danger">forbid: {p.forbiddenTools.join(",")}</Badge> : null}</div>{p.context && <div className="mb-1 rounded bg-surface-2 px-1.5 py-1 text-[11px] text-muted">context: {p.context}</div>}{p.turns.map((t, i) => <div key={i}><span className="text-muted">{t.role}: </span>{t.content}</div>)}{p.expected && <div className="mt-0.5 text-[11px] text-success">expected: {p.expected}</div>}</li>)}</ul></div>
        </CardContent></Card>
      ); })}
    </>
  );
}
