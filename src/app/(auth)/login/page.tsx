import { ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in · K-VeriAI" };

export default async function LoginPage(props: PageProps<"/login">) {
  const session = await getSession();
  if (session) redirect("/dashboard");
  const sp = await props.searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><ShieldCheck className="h-6 w-6" /></div>
          <div>
            <div className="text-lg font-semibold tracking-tight">K-VeriAI</div>
            <div className="text-xs text-muted">AI Governance, Evaluation & Assurance Platform</div>
          </div>
        </div>
        <LoginForm next={next} />
        <div className="mt-6 rounded-lg border border-border bg-surface p-4 text-xs text-muted">
          <p className="mb-2 font-medium text-foreground">Demo accounts (password: <code>demo1234</code>)</p>
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            <li><code>admin@kveriai.demo</code> — Admin (Verification Body)</li>
            <li><code>tester@kveriai.demo</code> — Tester</li>
            <li><code>reviewer@kveriai.demo</code> — Reviewer</li>
            <li><code>approver@kveriai.demo</code> — Approver</li>
            <li><code>owner@acme.demo</code> — Governance Owner (Enterprise)</li>
            <li><code>viewer@acme.demo</code> — Viewer (Enterprise)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
