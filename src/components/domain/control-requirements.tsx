import Link from "next/link";
import { Info } from "lucide-react";
import { HoverCard } from "@/components/ui/hover-card";
import { localizeRequirement } from "@/lib/i18n/content";
import type { Locale } from "@/lib/i18n/dict";

type Req = { requirement: { ref: string; title: string; framework: { code: string } } };
const ORDER = ["ISO_42001", "EU_AI_ACT", "NIST_AI_RMF", "NIST_ARIA", "KR_AI_BASIC_ACT"];

/** Control code + name; hovering (or focusing / tapping) shows the mapped framework requirements, localised. */
export function ControlWithRequirements({ code, name, requirements, locale, t, L }: { code: string; name: string; requirements: Req[]; locale: Locale; t: (k: string) => string; L: (v: string) => string }) {
  const groups = new Map<string, { ref: string; title: string }[]>();
  for (const r of requirements) {
    const fw = r.requirement.framework.code;
    const loc = localizeRequirement(locale, fw, r.requirement);
    groups.set(fw, [...(groups.get(fw) ?? []), { ref: loc.ref, title: loc.title }]);
  }
  const rank = (fw: string) => (ORDER.includes(fw) ? ORDER.indexOf(fw) : ORDER.length);
  const fws = [...groups.keys()].sort((a, b) => rank(a) - rank(b));
  const content = (
    <div>
      <p className="mb-2 font-semibold"><span className="font-mono text-muted">{code}</span> {name}</p>
      <p className="mb-2 text-[11px] text-muted">{t("Mapped framework requirements ({n})").replace("{n}", String(requirements.length))}</p>
      {fws.length === 0 && <p className="text-muted">{t("No mapped requirements.")}</p>}
      <div className="space-y-2.5">
        {fws.map((fw) => (
          <div key={fw}>
            <Link href={`/frameworks/${fw}`} className="mb-1 inline-block text-[11px] font-semibold uppercase tracking-wide text-primary hover:underline">{L(fw)}</Link>
            <ul className="space-y-0.5">{groups.get(fw)!.sort((a, b) => a.ref.localeCompare(b.ref, undefined, { numeric: true })).map((r) => <li key={r.ref} className="flex gap-2"><span className="w-24 shrink-0 font-mono text-[11px] text-muted">{r.ref}</span><span>{r.title}</span></li>)}</ul>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <HoverCard content={content} label={t("Show mapped requirements")} className="inline-flex items-center gap-1">
      <span className="font-mono text-xs text-muted">{code}</span> <span className="underline decoration-dotted decoration-muted underline-offset-4">{name}</span><Info className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
    </HoverCard>
  );
}
