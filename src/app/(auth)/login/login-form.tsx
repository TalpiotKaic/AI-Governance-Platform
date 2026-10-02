"use client";
import { useI18n } from "@/lib/i18n/client";
import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function LoginForm({ next }: { next?: string }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, undefined);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("Sign in")}</CardTitle>
        <CardDescription>{t("Use your organization account to continue.")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {next && <input type="hidden" name="next" value={next} />}
          <Field label={t("Email")}><Input name="email" type="email" autoComplete="username" required defaultValue="admin@kveriai.demo" /></Field>
          <Field label={t("Password")}><Input name="password" type="password" autoComplete="current-password" required defaultValue="demo1234" /></Field>
          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>{pending ? t("Signing in…") : t("Sign in")}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
