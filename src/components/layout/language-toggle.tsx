"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { LOCALES, LOCALE_META, type Locale } from "@/lib/i18n/dict";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale } = useI18n();
  const pathname = usePathname();
  const sp = useSearchParams();
  const next = encodeURIComponent(pathname + (sp.toString() ? `?${sp.toString()}` : ""));
  const item = (l: Locale, label: string) => (
    <a href={`/api/locale?l=${l}&next=${next}`} className={cn("rounded px-2 py-0.5 text-xs font-medium transition-colors", locale === l ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground")} aria-current={locale === l ? "true" : undefined}>{label}</a>
  );
  return (
    <div className={cn("flex items-center gap-1 rounded-md border border-border p-0.5", className)} title={LOCALES.map((l) => LOCALE_META[l].native).join(" / ")}>
      <Languages className="ml-1 h-3.5 w-3.5 text-muted" />
      {LOCALES.map((l) => <span key={l}>{item(l, LOCALE_META[l].short)}</span>)}
    </div>
  );
}
