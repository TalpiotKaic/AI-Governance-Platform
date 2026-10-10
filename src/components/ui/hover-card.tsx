"use client";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * Hover / focus / tap popover rendered in a portal with fixed positioning, so it is never clipped by
 * scrolling table containers. Stays open while the pointer is over the trigger or the card.
 */
export function HoverCard({ children, content, className, cardClassName, label }: { children: React.ReactNode; content: React.ReactNode; className?: string; cardClassName?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; maxHeight: number; above: boolean } | null>(null);
  const trigger = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();

  const place = useCallback(() => {
    const el = trigger.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.min(448, window.innerWidth - 16);
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    const below = window.innerHeight - r.bottom - 12, above = r.top - 12;
    const showAbove = below < 240 && above > below;
    setPos({ top: showAbove ? r.top - 6 : r.bottom + 6, left, maxHeight: Math.max(160, Math.min(420, showAbove ? above : below)), above: showAbove });
  }, []);
  const show = () => { if (timer.current) clearTimeout(timer.current); place(); setOpen(true); };
  const hide = () => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(false), 120); };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onMove = () => place();
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("scroll", onMove, true); window.removeEventListener("resize", onMove); };
  }, [open, place]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <>
      <span ref={trigger} tabIndex={0} role="button" aria-label={label} aria-expanded={open} aria-describedby={open ? id : undefined}
        onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} onClick={() => (open ? setOpen(false) : show())}
        className={cn("cursor-help rounded outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}>{children}</span>
      {open && pos && typeof document !== "undefined" && createPortal(
        <div id={id} role="tooltip" onMouseEnter={show} onMouseLeave={hide}
          style={{ position: "fixed", left: pos.left, top: pos.top, maxHeight: pos.maxHeight, transform: pos.above ? "translateY(-100%)" : undefined }}
          className={cn("z-[60] w-[min(28rem,calc(100vw-1rem))] overflow-y-auto rounded-lg border border-border bg-surface p-3 text-xs text-foreground shadow-xl", cardClassName)}>
          {content}
        </div>, document.body)}
    </>
  );
}
