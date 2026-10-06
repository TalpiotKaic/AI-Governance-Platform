import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { redirectLocation } from "@/lib/origin";

const PUBLIC_PREFIXES = ["/login", "/trust", "/print", "/api/locale", "/api/public", "/api/evaluation-api", "/_next", "/favicon.ico", "/brand", "/kveriai_logo.jpg"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p))) {
    return NextResponse.next();
  }
  if (pathname === "/") {
    return NextResponse.next();
  }
  const hasSession = request.cookies.has("kveriai_session");
  if (!hasSession) {
    // Proxy (middleware) responses need an absolute Location; fall back to Next's own notion of the request origin.
    const location = redirectLocation(request.headers, request.url, `/login?next=${encodeURIComponent(pathname)}`);
    return new NextResponse(null, { status: 303, headers: { Location: location.startsWith("/") ? new URL(location, request.nextUrl.origin).toString() : location } });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|kveriai_logo.jpg).*)"],
};
