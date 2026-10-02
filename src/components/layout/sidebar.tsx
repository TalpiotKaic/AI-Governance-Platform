"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Boxes, ShieldAlert, Scale, FlaskConical, ClipboardList, Library, FolderCheck,
  FileText, CheckSquare, Siren, BookOpen, Settings, Globe, Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";

const nav = [
  { section: "Overview", items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  {
    section: "Govern",
    items: [
      { href: "/systems", label: "AI Inventory", icon: Boxes },
      { href: "/risks", label: "Risk Register", icon: ShieldAlert },
      { href: "/frameworks", label: "Frameworks & Controls", icon: Scale },
      { href: "/policies", label: "Policies", icon: BookOpen },
      { href: "/approvals", label: "Approvals & Tasks", icon: CheckSquare },
      { href: "/incidents", label: "Incidents", icon: Siren },
    ],
  },
  {
    section: "Evaluate & Verify",
    items: [
      { href: "/plans", label: "Evaluation Plans", icon: ClipboardList },
      { href: "/evaluations", label: "Evaluation Runs", icon: FlaskConical },
      { href: "/library", label: "Test Library", icon: Library },
    ],
  },
  {
    section: "Prove",
    items: [
      { href: "/evidence", label: "Evidence Center", icon: FolderCheck },
      { href: "/reports", label: "Reports & Packs", icon: FileText },
    ],
  },
  {
    section: "Admin",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar({ orgName, orgSlug, trustEnabled }: { orgName: string; orgSlug: string; trustEnabled: boolean }) {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <aside className="no-print hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Image src="/kveriai_logo.jpg" alt="K-VeriAI Logo" width={32} height={32} className="h-8 w-8 rounded-md object-cover" />
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">{t("K-VeriAI")}</div>
          <div className="text-[10px] text-muted">{t("AI Governance & Assurance")}</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-3 scroll-thin">
        {nav.map((group) => (
          <div key={group.section} className="mb-4">
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted">{t(group.section)}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                        active ? "bg-primary-soft font-medium text-primary" : "text-foreground/80 hover:bg-surface-2 hover:text-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {t(item.label)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {trustEnabled && (
          <div className="mb-4">
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted">{t("Public")}</p>
            <Link href={`/trust/${orgSlug}`} target="_blank" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground/80 hover:bg-surface-2">
              <Globe className="h-4 w-4" /> {t("AI Trust Center")}
            </Link>
          </div>
        )}
      </nav>
      <div className="border-t border-border px-4 py-3 text-xs text-muted">
        <div className="flex items-center gap-1.5"><Bot className="h-3.5 w-3.5" /><span className="truncate">{orgName}</span></div>
      </div>
    </aside>
  );
}
