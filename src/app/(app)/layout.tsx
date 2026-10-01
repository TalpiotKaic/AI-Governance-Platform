import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const org = await db.organization.findUnique({ where: { id: user.orgId }, select: { trustCenterEnabled: true } });
  return (
    <div className="flex min-h-screen">
      <Sidebar orgName={user.orgName} orgSlug={user.orgSlug} trustEnabled={org?.trustCenterEnabled ?? false} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
