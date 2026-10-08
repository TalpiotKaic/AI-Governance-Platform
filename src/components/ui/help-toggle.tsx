"use client";
import { useId, useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

/** Small "?" button that reveals an inline reference panel. Theme-aware; content is passed as children. */
export function HelpToggle({ children, className, label }: { children: React.ReactNode; className?: string; label?: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)} title={label ?? t("Show help")}
        className={cn("inline-flex h-4 w-4 items-center justify-center rounded-full bg-info-soft text-[10px] font-bold text-info hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring", className)}>?</button>
      {open && <div id={id} className="mt-2 w-full basis-full rounded-md border border-info/30 bg-info-soft/60 p-3 text-[11px] leading-relaxed text-foreground">{children}</div>}
    </>
  );
}
