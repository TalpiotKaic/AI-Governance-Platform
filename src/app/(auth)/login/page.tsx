import { redirect } from "next/navigation";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";
import { getI18n } from "@/lib/i18n/server";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Suspense } from "react";

export const metadata = { title: "Sign in · K-VeriAI" };

export default async function LoginPage(props: PageProps<"/login">) {
  const session = await getSession();
  if (session) redirect("/dashboard");
  const { t, L } = await getI18n();
  const sp = await props.searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Image src="/kveriai_logo.jpg" alt="K-VeriAI Logo" width={40} height={40} className="h-10 w-10 rounded-lg object-cover" />
          <div>
            <div className="text-lg font-semibold tracking-tight">{t("K-VeriAI")}</div>
            <div className="text-xs text-muted">{t("AI Governance, Evaluation & Assurance Platform")}</div>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2"><Suspense><LanguageToggle /></Suspense><ThemeToggle compact /></div>
        <LoginForm next={next} />
        <div className="mt-6 rounded-lg border border-border bg-surface p-4 text-xs text-muted">
          <p className="mb-2 font-medium text-foreground">{t("Demo accounts (password: demo1234)")}</p>
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            <li><code>admin@kveriai.demo</code> — {L("ADMIN")} ({t("Verification Body")})</li>
            <li><code>tester@kveriai.demo</code> — {L("TESTER")}</li>
            <li><code>reviewer@kveriai.demo</code> — {L("REVIEWER")}</li>
            <li><code>approver@kveriai.demo</code> — {L("APPROVER")}</li>
            <li><code>owner@acme.demo</code> — {L("GOVERNANCE_OWNER")} ({t("Enterprise")})</li>
            <li><code>viewer@acme.demo</code> — {L("VIEWER")} ({t("Enterprise")})</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
