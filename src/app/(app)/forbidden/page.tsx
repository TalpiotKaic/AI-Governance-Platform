import Link from "next/link";
import { ShieldOff } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";
import { Button } from "@/components/ui/button";

export default async function ForbiddenPage(props: PageProps<"/forbidden">) {
  const { t, L } = await getI18n();
  const user = await requireUser();
  const sp = await props.searchParams;
  const need = typeof sp.need === "string" ? sp.need : "";
  return (
    <div className="mx-auto mt-16 max-w-md rounded-lg border border-border bg-surface p-8 text-center">
      <ShieldOff className="mx-auto mb-3 h-8 w-8 text-muted" />
      <h1 className="text-lg font-semibold">{t("You don't have permission for this page")}</h1>
      <p className="mt-2 text-sm text-muted">{t("Your role")}: <strong>{L(user.role)}</strong>{need && <> · {t("Required permission")}: <code>{need}</code></>}</p>
      <p className="mt-1 text-xs text-muted">{t("Ask an administrator to change your role in Settings → Users & roles.")}</p>
      <Link href="/dashboard" className="mt-5 inline-block"><Button variant="outline">{t("Back to dashboard")}</Button></Link>
    </div>
  );
}
