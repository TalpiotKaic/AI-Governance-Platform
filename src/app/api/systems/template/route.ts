import { getSession } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getLocale } from "@/lib/i18n/server";
import { toLocale } from "@/lib/i18n/dict";
import { buildSystemsTemplate } from "@/lib/import/systems-xlsx";

/** GET /api/systems/template?l=ko → Excel template for bulk AI-inventory registration (UI language by default). */
export async function GET(req: Request) {
  const user = await getSession();
  if (!user || !can(user.role, "systems.write")) return new Response("Forbidden", { status: 403 });
  const url = new URL(req.url);
  const locale = url.searchParams.get("l") ? toLocale(url.searchParams.get("l")) : await getLocale();
  const buf = await buildSystemsTemplate(locale);
  return new Response(new Uint8Array(buf), {
    headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename="kveriai-ai-inventory-template.${locale}.xlsx"`,
      "cache-control": "no-store",
    },
  });
}
