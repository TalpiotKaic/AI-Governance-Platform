import type { Block, ReportContent } from "@/lib/reports/types";
import { Badge, toneForSeverity, toneForStatus, toneForVerdict } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/progress";
import { fmtDate } from "@/lib/utils";
import { labelFor } from "@/lib/i18n/labels";
import { rt } from "@/lib/reports/dict";
import { toLocale, type Locale } from "@/lib/i18n/dict";
import { cn } from "@/lib/utils";

function isStatusy(v: string) {
  return /^(PASS|WARN|FAIL|NOT_EVALUATED|COVERED|PARTIAL|GAP|UNMAPPED|VERIFIED|IMPLEMENTED|IN_PROGRESS|NOT_STARTED|NOT_APPLICABLE|CRITICAL|HIGH|MEDIUM|LOW|INFO|OPEN|MITIGATED|MITIGATING|ACCEPTED|IDENTIFIED|ASSESSED|CLOSED|GENERATED|UPLOADED|ATTESTATION|VALID|EXPIRED|DRAFT|ISSUED|APPROVED|SUPERSEDED|IN_REVIEW|DEMO|LIVE|low|medium|high|critical|Yes|No)$/.test(v);
}
function CellBadge({ v, lang = "en" }: { v: string; lang?: Locale }) {
  const up = v.toUpperCase();
  const tone = up === "COVERED" || up === "YES" ? "success" : up === "PARTIAL" ? "warning" : up === "GAP" || up === "UNMAPPED" || up === "NO" ? "danger" : up === "LIVE" ? "accent" : up === "DEMO" ? "warning" : toneForVerdict(up) !== "neutral" ? toneForVerdict(up) : toneForSeverity(up) !== "neutral" ? toneForSeverity(up) : toneForStatus(up);
  return <Badge tone={tone}>{isStatusy(v) ? labelFor(lang, v) : v}</Badge>;
}

export function RenderBlock({ block, lang = "en" }: { block: Block; lang?: Locale }) {
  const r = (k: string) => rt(lang, k);
  switch (block.type) {
    case "paragraph":
      return <p className={cn("text-sm leading-relaxed", block.tone === "muted" && "text-muted", block.tone === "warning" && "text-warning", block.tone === "danger" && "text-danger", block.tone === "success" && "text-success")}>{block.text}</p>;
    case "callout": {
      const t = block.tone ?? "info";
      return (
        <div className={cn("rounded-md border px-4 py-3 text-sm", t === "warning" && "border-warning/40 bg-warning-soft/40", t === "danger" && "border-danger/40 bg-danger-soft/40", t === "success" && "border-success/40 bg-success-soft/40", t === "info" && "border-info/40 bg-info-soft/40")}>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide">{block.title}</p>
          <p className="text-sm">{block.text}</p>
        </div>
      );
    }
    case "kv":
      return (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {block.items.map((it, i) => (
            <div key={i} className="flex flex-col border-b border-border/60 pb-1.5">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-muted">{it.label}</dt>
              <dd className="break-words">{it.value || "—"}</dd>
            </div>
          ))}
        </dl>
      );
    case "list":
      return block.ordered ? <ol className="list-decimal space-y-1 pl-5 text-sm">{block.items.map((it, i) => <li key={i}>{it}</li>)}</ol> : <ul className="list-disc space-y-1 pl-5 text-sm">{block.items.map((it, i) => <li key={i}>{it}</li>)}</ul>;
    case "table":
      return (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-xs">
            <thead className="bg-surface-2"><tr>{block.columns.map((c) => <th key={c} className="px-2 py-1.5 text-left font-semibold text-muted">{c}</th>)}</tr></thead>
            <tbody>
              {block.rows.length === 0 && <tr><td colSpan={block.columns.length} className="px-2 py-3 text-center text-muted">{r("No entries")}</td></tr>}
              {block.rows.map((r, i) => (
                <tr key={i} className="border-t border-border/60 align-top">
                  {r.map((c, j) => <td key={j} className="px-2 py-1.5">{block.badgeColumns?.includes(j) && c !== null && c !== "—" && String(c).length < 40 ? <CellBadge v={String(c)} lang={lang} /> : (c ?? "—")}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "metrics":
      return (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-xs">
            <thead className="bg-surface-2"><tr><th className="px-2 py-1.5 text-left text-muted">{r("Category")}</th><th className="px-2 py-1.5 text-left text-muted">{r("Metric")}</th><th className="px-2 py-1.5 text-right text-muted">{r("Measured")}</th><th className="px-2 py-1.5 text-right text-muted">{r("Threshold")}</th><th className="px-2 py-1.5 text-right text-muted">n</th><th className="px-2 py-1.5 text-left text-muted">{r("Verdict")}</th></tr></thead>
            <tbody>{block.items.map((m, i) => (
              <tr key={i} className="border-t border-border/60"><td className="px-2 py-1.5"><Badge>{m.category}</Badge></td><td className="px-2 py-1.5">{m.name}</td><td className="px-2 py-1.5 text-right tabular-nums">{m.value}</td><td className="px-2 py-1.5 text-right tabular-nums text-muted">{m.threshold}</td><td className="px-2 py-1.5 text-right tabular-nums text-muted">{m.sampleSize ?? "—"}</td><td className="px-2 py-1.5"><CellBadge v={m.verdict} lang={lang} /></td></tr>
            ))}</tbody>
          </table>
        </div>
      );
    case "findings":
      return (
        <div className="space-y-2">
          {block.items.map((f) => (
            <div key={f.code} className="rounded-md border border-border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted">{f.code}</span>
                <CellBadge v={f.severity} lang={lang} />
                <Badge>{f.category}</Badge>
                <CellBadge v={f.status} lang={lang} />
                <span className="text-sm font-medium">{f.title}</span>
              </div>
              {f.excerpt && <blockquote className="mt-2 border-l-2 border-border pl-3 text-xs italic text-muted">“{f.excerpt}”</blockquote>}
              {f.recommendation && <p className="mt-2 text-xs"><span className="font-semibold">{r("Recommendation:")} </span>{f.recommendation}</p>}
            </div>
          ))}
        </div>
      );
    case "score":
      return (
        <div className="flex items-center gap-4 rounded-md border border-border p-3">
          <ScoreRing value={block.value} label={block.label} />
          <div><p className="text-xs text-muted">{block.label}</p><div className="mt-1"><CellBadge v={block.verdict} lang={lang} /></div></div>
        </div>
      );
    case "signatures":
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {block.roles.map((r) => (
            <div key={r.role} className="rounded-md border border-dashed border-border p-3 text-xs">
              <p className="font-semibold uppercase tracking-wide text-muted">{r.role}</p>
              <p className="mt-6 border-b border-border pb-1">{r.name || " "}</p>
              <p className="mt-1 text-muted">{rt(lang, "Signature / date")} {r.date}</p>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

export function ReportRenderer({ content, code, version, status, issuedAt }: { content: ReportContent; code: string; version: number; status: string; issuedAt?: Date | null }) {
  const lang: Locale = toLocale(content.meta.language);
  const r = (k: string) => rt(lang, k);
  return (
    <article className="mx-auto max-w-4xl">
      <header className="mb-6 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="font-mono">{code}</span><span>·</span><span>v{version}</span><span>·</span><CellBadge v={status} lang={lang} />
          {content.meta.mode && <><span>·</span><CellBadge v={content.meta.mode.split("/")[0]} lang={lang} /></>}
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{labelFor(lang, content.meta.reportType)}</h1>
        <p className="text-sm text-muted">{content.meta.systemCode} · {content.meta.systemName} — {content.meta.organization}</p>
        <p className="text-xs text-muted">{r("Generated")} {fmtDate(content.meta.generatedAt, true)}{issuedAt ? ` · ${r("Issued")} ${fmtDate(issuedAt, true)}` : ""}{content.meta.runCodes?.length ? ` · ${r("Runs:")} ${content.meta.runCodes.join(", ")}` : ""}</p>
        {content.meta.disclaimer && <p className="mt-2 rounded bg-warning-soft/50 px-3 py-2 text-xs text-warning">{content.meta.disclaimer}</p>}
      </header>
      <nav className="no-print mb-6 flex flex-wrap gap-2 text-xs">
        {content.sections.map((s, i) => <a key={s.id} href={`#${s.id}`} className="rounded-full border border-border px-2 py-0.5 text-muted hover:text-foreground">{i + 1}. {s.title}</a>)}
      </nav>
      <div className="space-y-8">
        {content.sections.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-20">
            <h2 className="mb-3 text-base font-semibold">{i + 1}. {s.title}</h2>
            <div className="space-y-3">{s.blocks.map((b, j) => <RenderBlock key={j} block={b} lang={lang} />)}</div>
          </section>
        ))}
      </div>
      <footer className="mt-10 border-t border-border pt-4 text-[11px] text-muted">K-VeriAI · {code} v{version} · {r("This document is generated from platform records; changes to the underlying system invalidate test-derived evidence until re-evaluation.")}</footer>
    </article>
  );
}
