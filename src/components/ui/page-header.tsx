import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function PageHeader({ title, description, crumbs, actions }: { title: string; description?: string; crumbs?: { label: string; href?: string }[]; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        {crumbs && crumbs.length > 0 && (
          <nav className="mb-1 flex items-center gap-1 text-xs text-muted">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                {c.href ? <Link href={c.href} className="hover:text-foreground">{c.label}</Link> : <span>{c.label}</span>}
                {i < crumbs.length - 1 && <ChevronRight className="h-3 w-3" />}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
