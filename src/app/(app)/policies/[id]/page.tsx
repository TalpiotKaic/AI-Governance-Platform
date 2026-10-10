import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Download, FilePen, RotateCcw, Send, Trash2 } from "lucide-react";
import { requireUser, userCan } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge, toneForStatus } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { BackButton } from "@/components/ui/back-button";
import { Markdown } from "@/components/domain/markdown";
import { ControlWithRequirements } from "@/components/domain/control-requirements";
import { fmtDate } from "@/lib/utils";
import { getI18n } from "@/lib/i18n/server";
import { localizeControl } from "@/lib/i18n/content";
import { DOC_TYPES, REVIEW_CYCLES, SUGGESTED_CONTROLS, daysUntil, docStatusLabel, ensureDocumentLifecycle, isReviewDueSoon } from "@/lib/documents";
import { approveDocumentAction, confirmReviewAction, deleteDocumentAction, retireDocumentAction, returnDocumentAction, reviseDocumentAction, saveDocumentAction, submitDocumentAction } from "../actions";
import { DocumentForm } from "../document-form";
import { ProcessStrip } from "../process-strip";

const ERRORS: Record<string, string> = {
  own: "The author cannot review their own document. Ask another reviewer (administrators may self-review; it is flagged).",
  empty: "Add the document text or attach a file before requesting review.",
  not_draft: "Only drafts can be edited, submitted or deleted.",
  not_in_review: "This document is not awaiting review.",
  not_active: "Only documents in force or expired can be reviewed, revised or retired.",
  title: "Enter a title.",
  file: "Unsupported or too large file (MD, TXT, PDF, DOCX, HWP, XLSX, PPTX · max 10 MB).",
};

export default async function DocumentPage(props: PageProps<"/policies/[id]">) {
  const { locale, t, L } = await getI18n();
  const user = await requireUser();
  const { id } = await props.params;
  const sp = await props.searchParams;
  await ensureDocumentLifecycle(user.orgId);
  const d = await db.policy.findFirst({ where: { id, orgId: user.orgId }, include: { owner: true } });
  if (!d) notFound();
  const names = new Map((await db.user.findMany({ where: { orgId: user.orgId }, select: { id: true, name: true } })).map((u) => [u.id, u.name]));
  const controlsAll = (await db.control.findMany({ orderBy: { sortOrder: "asc" }, include: { requirements: { include: { requirement: { include: { framework: true } } } } } })).map((c) => localizeControl(locale, c));
  const linked = controlsAll.filter((c) => d.controlCodes.includes(c.code));
  // Version history: walk back through previousId, then forward through newer revisions
  const chain: typeof d[] = [d];
  for (let p = d.previousId, n = 0; p && n < 20; n++) { const x = await db.policy.findFirst({ where: { id: p, orgId: user.orgId }, include: { owner: true } }); if (!x) break; chain.push(x); p = x.previousId; }
  for (let c = d.id, n = 0; n < 20; n++) { const x = await db.policy.findFirst({ where: { previousId: c, orgId: user.orgId }, include: { owner: true } }); if (!x) break; chain.unshift(x); c = x.id; }
  const evidence = d.evidenceId ? await db.evidence.findFirst({ where: { id: d.evidenceId, orgId: user.orgId } }) : null;
  const canWrite = userCan(user, "policies.write"), canReview = userCan(user, "policies.review");
  const own = user.id === d.ownerId || user.id === d.submittedById;
  const editing = sp.edit === "1" && d.status === "DRAFT" && canWrite;
  const error = typeof sp.error === "string" ? ERRORS[sp.error] : undefined;
  const stage = d.status === "DRAFT" ? "DRAFT" : d.status === "IN_REVIEW" ? "IN_REVIEW" : d.status === "ACTIVE" && !isReviewDueSoon(d) ? "ACTIVE" : d.status === "ACTIVE" || d.status === "EXPIRED" ? "REVIEW" : undefined;

  if (editing) return (
    <>
      <PageHeader title={`${t("Edit")}: ${d.title} v${d.version}`} crumbs={[{ label: t("Policies & documents"), href: "/policies" }, { label: d.title, href: `/policies/${d.id}` }, { label: t("Edit") }]} />
      {error && <p className="mb-3 rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger">{t(error)}</p>}
      <DocumentForm action={saveDocumentAction.bind(null, d.id)} cancelHref={`/policies/${d.id}`} controls={controlsAll.map((c) => ({ code: c.code, name: c.name }))} docTypes={DOC_TYPES} cycles={REVIEW_CYCLES} suggestions={SUGGESTED_CONTROLS} initial={{ title: d.title, docType: d.docType, version: d.version, reviewCycleMonths: d.reviewCycleMonths, content: d.content ?? "", controlCodes: d.controlCodes, fileName: d.fileName }} />
    </>
  );

  return (
    <>
      <PageHeader title={`${d.title} v${d.version}`} crumbs={[{ label: t("Policies & documents"), href: "/policies" }, { label: d.title }]} actions={<BackButton fallback="/policies" />} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge tone={d.status === "EXPIRED" ? "danger" : d.status === "IN_REVIEW" ? "info" : toneForStatus(d.status)}>{docStatusLabel(d.status, t, L)}</Badge>
        <Badge>{L(`DOC_${d.docType}`)}</Badge>
        {d.selfApproved && <Badge tone="warning">{t("Self-reviewed")}</Badge>}
        {d.status === "ACTIVE" && d.nextReviewDate && isReviewDueSoon(d) && <Badge tone="warning">{t("Review due in {n} days").replace("{n}", String(daysUntil(d.nextReviewDate)))}</Badge>}
        {d.status === "EXPIRED" && <Badge tone="danger">{t("Review date passed — no longer counts as evidence")}</Badge>}
      </div>
      <div className="mb-4"><ProcessStrip current={stage} /></div>
      {error && <p className="mb-3 rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger">{t(error)}</p>}
      {d.reviewComment && <p className="mb-3 rounded-md border border-info/30 bg-info-soft/60 px-3 py-2 text-sm"><span className="font-medium">{t("Reviewer comment")}:</span> {d.reviewComment}</p>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card><CardHeader className="flex-row items-center justify-between"><CardTitle>{t("Content")}</CardTitle>{d.fileName && <a href={`/policies/${d.id}/file`} target="_blank" rel="noreferrer"><Button size="sm" variant="outline"><Download className="h-3.5 w-3.5" /> {d.fileName}</Button></a>}</CardHeader><CardContent>
            {d.content ? <div className="max-h-[36rem] overflow-y-auto rounded-md border border-border bg-surface-2/30 p-4"><Markdown source={d.content} /></div> : <p className="text-sm text-muted">{d.fileName ? t("The content is in the attached file.") : t("No content yet.")}</p>}
          </CardContent></Card>
          <Card><CardHeader><CardTitle>{t("Controls this document satisfies")}</CardTitle><CardDescription>{t("Hover a control to see the framework requirements it covers.")}</CardDescription></CardHeader><CardContent>
            {linked.length ? <ul className="space-y-1.5 text-sm">{linked.map((c) => <li key={c.code}><ControlWithRequirements code={c.code} name={c.name} requirements={c.requirements} locale={locale} t={t} L={L} /></li>)}</ul> : <p className="text-sm text-muted">{t("No controls linked — the document will not count towards framework coverage.")}</p>}
          </CardContent></Card>
        </div>

        <div className="space-y-4">
          <Card><CardHeader><CardTitle>{t("Next step")}</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
            {d.status === "DRAFT" && (canWrite ? <>
              <p className="text-muted">{t("Finish the draft, then request review. A reviewer other than the author approves it.")}</p>
              <div className="flex flex-wrap gap-2">
                <Link href={`/policies/${d.id}?edit=1`}><Button variant="outline" size="sm"><FilePen className="h-3.5 w-3.5" /> {t("Edit")}</Button></Link>
                <form action={submitDocumentAction.bind(null, d.id)}><Button size="sm" type="submit"><Send className="h-3.5 w-3.5" /> {t("Request review")}</Button></form>
                <form><ConfirmButton variant="ghost" size="sm" formAction={deleteDocumentAction.bind(null, d.id)} message={t("Delete this draft?")}><Trash2 className="h-3.5 w-3.5" /> {t("Delete draft")}</ConfirmButton></form>
              </div></> : <p className="text-muted">{t("Draft in preparation.")}</p>)}
            {d.status === "IN_REVIEW" && (canReview && (!own || user.role === "ADMIN") ? <form className="space-y-2">
              <p className="text-muted">{t("Check that the document is complete and fit for purpose. Approval puts it in force and publishes it as organisation-wide evidence.")}</p>
              {own && <p className="rounded border border-warning/40 bg-warning-soft px-2 py-1 text-xs text-warning">{t("You are the author. As an administrator you may approve, but it will be recorded as a self-review.")}</p>}
              <Textarea name="comment" rows={2} placeholder={t("Review comment (optional)")} />
              <div className="flex flex-wrap gap-2"><Button type="submit" size="sm" formAction={approveDocumentAction.bind(null, d.id)}><CheckCircle2 className="h-3.5 w-3.5" /> {t("Approve and put in force")}</Button><Button type="submit" size="sm" variant="outline" formAction={returnDocumentAction.bind(null, d.id)}>{t("Return to draft")}</Button></div>
            </form> : <p className="text-muted">{t("Awaiting review by a reviewer other than the author.")}</p>)}
            {(d.status === "ACTIVE" || d.status === "EXPIRED") && <>
              <p className="text-muted">{d.status === "EXPIRED" ? t("The review date has passed. Confirm the document is still valid, or issue a new version.") : t("In force. At each review date, confirm it is unchanged or issue a new version.")}</p>
              {canReview && (!own || user.role === "ADMIN") && <form className="space-y-2"><Textarea name="comment" rows={2} placeholder={t("Review note (optional)")} /><Button type="submit" size="sm" formAction={confirmReviewAction.bind(null, d.id)}><CheckCircle2 className="h-3.5 w-3.5" /> {t("Reviewed — no change")}</Button></form>}
              {canWrite && <div className="flex flex-wrap gap-2 border-t border-border pt-3"><form action={reviseDocumentAction.bind(null, d.id)}><Button size="sm" variant="outline" type="submit"><RotateCcw className="h-3.5 w-3.5" /> {t("New version")}</Button></form><form><ConfirmButton variant="ghost" size="sm" formAction={retireDocumentAction.bind(null, d.id)} message={t("Retire this document? Its evidence stops counting.")}>{t("Retire")}</ConfirmButton></form></div>}
            </>}
            {(d.status === "SUPERSEDED" || d.status === "RETIRED") && <p className="text-muted">{d.status === "SUPERSEDED" ? t("Replaced by a newer version (see history).") : t("Retired. Kept for the record.")}</p>}
          </CardContent></Card>

          <Card><CardHeader><CardTitle>{t("Record")}</CardTitle></CardHeader><CardContent><dl className="space-y-1.5 text-xs">
            {[[t("Owner"), d.owner?.name ?? "—"], [t("Review cycle"), t("Every {n} months").replace("{n}", String(d.reviewCycleMonths))], [t("Submitted"), d.submittedAt ? `${fmtDate(d.submittedAt)} · ${names.get(d.submittedById ?? "") ?? ""}` : "—"], [t("Approved"), d.approvedAt ? `${fmtDate(d.approvedAt)} · ${names.get(d.approvedById ?? "") ?? ""}` : "—"], [t("Last reviewed"), fmtDate(d.lastReviewedAt)], [t("Next review"), fmtDate(d.nextReviewDate)], ["SHA-256", d.sha256 ? `${d.sha256.slice(0, 16)}…` : "—"]].map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="text-muted">{k}</dt><dd className="text-right">{v}</dd></div>)}
          </dl>
          {evidence && <Link href={`/evidence/${evidence.id}`} className="mt-3 flex items-center justify-between rounded-md border border-border px-2 py-1.5 text-xs hover:bg-surface-2"><span>{t("Organisation-wide evidence")}</span><Badge tone={toneForStatus(evidence.status)}>{L(evidence.status)}</Badge></Link>}
          </CardContent></Card>

          {chain.length > 1 && <Card><CardHeader><CardTitle>{t("Version history")}</CardTitle></CardHeader><CardContent><ul className="space-y-1 text-xs">{chain.map((x) => <li key={x.id} className={`flex items-center justify-between gap-2 rounded px-2 py-1 ${x.id === d.id ? "bg-primary-soft/30" : ""}`}><Link href={`/policies/${x.id}`} className="hover:underline">v{x.version}</Link><span className="text-muted">{fmtDate(x.approvedAt ?? x.createdAt)}</span><Badge tone={x.status === "EXPIRED" ? "danger" : toneForStatus(x.status)}>{docStatusLabel(x.status, t, L)}</Badge></li>)}</ul></CardContent></Card>}
        </div>
      </div>
    </>
  );
}
