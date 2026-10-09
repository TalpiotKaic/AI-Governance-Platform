"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Accessible modal dialog (native <dialog>): Esc and backdrop click close it. */
export function Modal({ open, onClose, title, children, className }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} onClose={onClose} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className={cn("m-auto w-[min(56rem,calc(100vw-2rem))] rounded-xl border border-border bg-surface p-0 text-foreground shadow-xl backdrop:bg-black/50", className)}>
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="cursor-pointer rounded-md p-1 text-muted hover:bg-surface-2 hover:text-foreground"><X className="h-4 w-4" /></button>
      </div>
      <div className="max-h-[75vh] overflow-y-auto px-5 py-4 text-sm leading-relaxed">{children}</div>
    </dialog>
  );
}
