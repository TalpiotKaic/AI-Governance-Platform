"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";

/** URL-driven tabs: ?tab=xxx. */
export function Tabs({ tabs, param = "tab", basePath }: { tabs: { key: string; label: string; count?: number }[]; param?: string; basePath?: string }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const { t: tr } = useI18n();
  const active = sp.get(param) ?? tabs[0]?.key;
  return (
    <div className="mb-4 flex gap-1 overflow-x-auto border-b border-border scroll-thin">
      {tabs.map((t) => {
        const params = new URLSearchParams(sp.toString());
        params.set(param, t.key);
        const href = `${basePath ?? pathname}?${params.toString()}`;
        const isActive = active === t.key;
        return (
          <Link
            key={t.key}
            href={href}
            className={cn(
              "-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors",
              isActive ? "border-primary font-medium text-foreground" : "border-transparent text-muted hover:text-foreground",
            )}
          >
            {tr(t.label)}
            {t.count !== undefined && <span className="rounded-full bg-surface-2 px-1.5 text-[11px] text-muted">{t.count}</span>}
          </Link>
        );
      })}
    </div>
  );
}
