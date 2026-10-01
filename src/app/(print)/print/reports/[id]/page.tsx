import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ReportRenderer } from "@/components/domain/report-renderer";
import type { ReportContent } from "@/lib/reports/types";

export default async function PrintReport(props: PageProps<"/print/reports/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const session = await getSession();
  const token = typeof sp.token === "string" ? sp.token : undefined;
  const r = await db.report.findUnique({ where: { id }, include: { org: true } });
  if (!r) notFound();
  // Allow either an authenticated member of the org or the internal PDF renderer token.
  if (!(session && session.orgId === r.orgId) && token !== process.env.AUTH_SECRET) notFound();
  return (
    <div className="min-h-screen bg-white p-10 text-black" style={{ colorScheme: "light" }}>
      <ReportRenderer content={r.content as unknown as ReportContent} code={r.code} version={r.version} status={r.status} issuedAt={r.issuedAt} />
    </div>
  );
}
