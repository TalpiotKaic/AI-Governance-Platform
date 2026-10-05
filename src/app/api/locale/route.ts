import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, toLocale } from "@/lib/i18n/dict";

/** GET /api/locale?l=ko&next=/dashboard — sets the UI language cookie and redirects back. */
export function GET(req: NextRequest) {
  const l = toLocale(req.nextUrl.searchParams.get("l"));
  const next = req.nextUrl.searchParams.get("next") ?? "/";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl.host;
  const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol.replace(":", "");
  const absoluteNext = next.startsWith("/") ? `${proto}://${host}${next}` : `${proto}://${host}/`;
  const res = new NextResponse(null, { status: 303 });
  res.headers.set("Location", absoluteNext);
  res.cookies.set(LOCALE_COOKIE, l, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return res;
}
