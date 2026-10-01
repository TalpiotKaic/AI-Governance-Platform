import Link from "next/link";
import { LogOut, User as UserIcon } from "lucide-react";
import { logoutAction } from "@/app/(auth)/login/actions";
import { enumLabel } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./theme-toggle";
import { MobileNav } from "./mobile-nav";

export function Topbar({ user }: { user: SessionUser }) {
  return (
    <header className="no-print sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <MobileNav />
        <Link href="/dashboard" className="text-sm font-semibold md:hidden">K-VeriAI</Link>
        <Badge tone={user.orgType === "VERIFICATION_BODY" ? "accent" : "neutral"}>{user.orgType === "VERIFICATION_BODY" ? "Verification Body" : "Enterprise"}</Badge>
        <span className="hidden text-sm text-muted sm:inline">{user.orgName}</span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="hidden items-center gap-2 rounded-md border border-border px-2 py-1 text-xs sm:flex">
          <UserIcon className="h-3.5 w-3.5 text-muted" />
          <span className="font-medium">{user.name}</span>
          <Badge tone="primary">{enumLabel(user.role)}</Badge>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-foreground" title="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
