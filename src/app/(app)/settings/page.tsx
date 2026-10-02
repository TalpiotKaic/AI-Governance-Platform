import { requireUser, hasRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { fmtDate} from "@/lib/utils";
import { addCredentialAction, createUserAction, deleteCredentialAction, setUserRoleAction, updateOrgAction } from "./actions";
import Link from "next/link";
import { getI18n } from "@/lib/i18n/server";

export const metadata = { title: "Settings" };
const ROLES = ["ADMIN", "GOVERNANCE_OWNER", "APPROVER", "REVIEWER", "TESTER", "VIEWER"];

export default async function SettingsPage() {
  const { t, L } = await getI18n();
  const user = await requireUser();
  const org = await db.organization.findUniqueOrThrow({ where: { id: user.orgId } });
  const users = await db.user.findMany({ where: { orgId: user.orgId }, orderBy: { createdAt: "asc" } });
  const creds = await db.providerCredential.findMany({ where: { orgId: user.orgId }, orderBy: { createdAt: "desc" } });
  const admin = hasRole(user, "ADMIN");
  const env = { anthropic: Boolean(process.env.ANTHROPIC_API_KEY), openai: Boolean(process.env.OPENAI_API_KEY), ollama: process.env.OLLAMA_BASE_URL ?? null };
  return (
    <>
      <PageHeader title={t("Settings")} description={t("Organisation, users & roles, LIVE-mode provider credentials (encrypted at rest), and the public AI Trust Center.")} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>{t("Organisation")}</CardTitle><CardDescription>{L(org.type)} · slug <code>{org.slug}</code></CardDescription></CardHeader><CardContent><form action={updateOrgAction} className="space-y-3"><Field label={t("Name")}><Input name="name" defaultValue={org.name} disabled={!admin} /></Field><div className="grid grid-cols-2 gap-3"><Field label={t("Country")}><Input name="country" defaultValue={org.country ?? ""} disabled={!admin} /></Field><Field label={t("Sector")}><Input name="sector" defaultValue={org.sector ?? ""} disabled={!admin} /></Field></div><Checkbox name="trustCenterEnabled" label={t("Enable public AI Trust Center")} defaultChecked={org.trustCenterEnabled} disabled={!admin} /><Field label={t("Trust Center introduction")}><Textarea name="trustCenterIntro" defaultValue={org.trustCenterIntro ?? ""} disabled={!admin} /></Field>{admin && <Button type="submit">{t("Save")}</Button>}{org.trustCenterEnabled && <Link href={`/trust/${org.slug}`} target="_blank" className="ml-3 text-sm text-primary hover:underline">{t("Open Trust Center →")}</Link>}</form></CardContent></Card>
        <Card><CardHeader><CardTitle>{t("LIVE-mode provider credentials")}</CardTitle><CardDescription>Keys are AES-256-GCM encrypted with AUTH_SECRET. Environment keys detected: Anthropic {env.anthropic ? "✓" : "—"}, OpenAI {env.openai ? "✓" : "—"}, Ollama base URL {env.ollama ?? "—"}.</CardDescription></CardHeader><CardContent>
          <ul className="mb-3 space-y-1.5 text-sm">{creds.map((c) => <li key={c.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2"><div><Badge tone="accent" className="mr-2">{c.provider}</Badge>{c.label}<span className="ml-2 text-xs text-muted">{c.defaultModel ?? ""}{c.baseUrl ? ` · ${c.baseUrl}` : ""} · added {fmtDate(c.createdAt)}</span></div>{admin && <form action={deleteCredentialAction.bind(null, c.id)}><Button size="sm" variant="ghost" type="submit">{t("Remove")}</Button></form>}</li>)}{creds.length === 0 && <li className="text-muted">{t("No stored credentials. DEMO mode works without any.")}</li>}</ul>
          {admin && <form action={addCredentialAction} className="grid grid-cols-1 gap-2 rounded-md border border-border p-3 sm:grid-cols-2"><Select name="provider" defaultValue="anthropic"><option value="anthropic">anthropic</option><option value="openai">openai</option><option value="openai-compatible">openai-compatible (Ollama / vLLM / gateway)</option></Select><Input name="label" placeholder={t("Label")} /><Input name="apiKey" type="password" placeholder={t("API key")} required autoComplete="off" /><Input name="defaultModel" placeholder={t("Default model (e.g. claude-sonnet-5-5)")} /><Input name="baseUrl" placeholder={t("Base URL (optional)")} className="sm:col-span-2" /><Button type="submit" className="sm:col-span-2">{t("Add credential")}</Button></form>}
        </CardContent></Card>
        <Card className="lg:col-span-2"><CardHeader><CardTitle>{t("Users & roles")}</CardTitle><CardDescription>{t("Roles: Admin · Governance Owner · Approver (authorised signatory) · Reviewer (technical review) · Tester (runs evaluations) · Viewer.")}</CardDescription></CardHeader><CardContent className="px-0 pb-0">
          <Table><THead><TR><TH>{t("Name")}</TH><TH>{t("Email")}</TH><TH>{t("Title")}</TH><TH>{t("Role")}</TH><TH>{t("Since")}</TH></TR></THead><TBody>{users.map((u) => <TR key={u.id}><TD className="font-medium">{u.name}</TD><TD className="text-xs">{u.email}</TD><TD className="text-xs text-muted">{u.title ?? "—"}</TD><TD>{admin ? <form action={setUserRoleAction.bind(null, u.id)} className="flex items-center gap-1"><Select name="role" defaultValue={u.role} className="h-7 w-44 text-xs">{ROLES.map((r) => <option key={r} value={r}>{L(r)}</option>)}</Select><Button size="sm" variant="ghost" type="submit">{t("Save")}</Button></form> : <Badge tone="primary">{L(u.role)}</Badge>}</TD><TD className="text-xs text-muted">{fmtDate(u.createdAt)}</TD></TR>)}</TBody></Table>
          {admin && <form action={createUserAction} className="grid grid-cols-1 gap-2 border-t border-border p-4 sm:grid-cols-5"><Input name="name" placeholder={t("Name")} required /><Input name="email" type="email" placeholder={t("Email")} required /><Input name="title" placeholder={t("Title")} /><Select name="role" defaultValue="VIEWER">{ROLES.map((r) => <option key={r} value={r}>{L(r)}</option>)}</Select><div className="flex gap-2"><Input name="password" type="password" placeholder={t("Initial password")} /><Button type="submit">{t("Add")}</Button></div></form>}
        </CardContent></Card>
        <Card className="lg:col-span-2"><CardHeader><CardTitle>{t("Integrations")}</CardTitle></CardHeader><CardContent className="text-sm text-muted"><p>• <Link href="/evaluation-api" className="text-primary hover:underline">{t("HTTP Evaluation API contract")}</Link> — connect any model or agent to K-VeriAI (NIST AI 200-3 Evaluation API style).</p><p className="mt-1">• CI/CD quality gate: call <code>POST /api/public/evaluation-api/sample</code> style targets from your pipeline, or run an evaluation and read <code>/api/reports/:id/export</code> to gate deployments on verdict.</p></CardContent></Card>
      </div>
    </>
  );
}
