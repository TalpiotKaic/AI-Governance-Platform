import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, toLocale } from "@/lib/i18n/dict";

/** GET /api/locale?l=ko&next=/dashboard — sets the UI language cookie and redirects back. */
export function GET(req: NextRequest) {
  const l = toLocale(req.nextUrl.searchParams.get("l"));
  const next = req.nextUrl.searchParams.get("next") ?? "/";
  const target = new URL(next.startsWith("/") ? next : "/", req.nextUrl.origin);
  const res = NextResponse.redirect(target, 303);
  res.cookies.set(LOCALE_COOKIE, l, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return res;
}
