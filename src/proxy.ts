import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
    return new NextResponse(null, { 
      status: 303, 
      headers: { Location: `/login?next=${encodeURIComponent(pathname)}` } 
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|kveriai_logo.jpg).*)"],
};
