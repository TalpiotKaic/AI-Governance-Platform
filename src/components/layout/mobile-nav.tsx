"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const links = [
  ["/dashboard", "Dashboard"], ["/systems", "AI Inventory"], ["/risks", "Risk Register"], ["/frameworks", "Frameworks & Controls"],
  ["/plans", "Evaluation Plans"], ["/evaluations", "Evaluation Runs"], ["/library", "Test Library"], ["/evidence", "Evidence Center"],
  ["/reports", "Reports & Packs"], ["/approvals", "Approvals & Tasks"], ["/incidents", "Incidents"], ["/policies", "Policies"], ["/settings", "Settings"],
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button type="button" onClick={() => setOpen(true)} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-2" aria-label="Open menu">
        <Menu className="h-5 w-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)}>
          <div className="h-full w-64 bg-surface p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold">K-VeriAI</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <ul className="space-y-1">
              {links.map(([href, label]) => (
                <li key={href}><Link href={href} onClick={() => setOpen(false)} className="block rounded-md px-2 py-2 text-sm hover:bg-surface-2">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
