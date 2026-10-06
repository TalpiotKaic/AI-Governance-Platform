/**
 * Public origin resolution for redirects and server-side self requests.
 * Order: APP_ORIGIN env (recommended behind a tunnel/reverse proxy) → forwarded headers only when TRUST_PROXY_HEADERS=1 → the request URL itself.
 * Redirect helpers fall back to a relative Location so an untrusted Host header can never steer a redirect off-site.
 */
type HeaderSource = { get(name: string): string | null };

export function publicOrigin(headers: HeaderSource, requestUrl: string): string | null {
  const env = process.env.APP_ORIGIN?.trim();
  if (env) return env.replace(/\/$/, "");
  if (process.env.TRUST_PROXY_HEADERS === "1") {
    const host = headers.get("x-forwarded-host") ?? headers.get("host");
    const proto = headers.get("x-forwarded-proto") ?? new URL(requestUrl).protocol.replace(":", "");
    if (host) return `${proto}://${host}`;
  }
  return null;
}

/** Location header for a redirect to an app path: absolute when a trusted origin is known, otherwise relative. */
export function redirectLocation(headers: HeaderSource, requestUrl: string, path: string): string {
  const safePath = path.startsWith("/") && !path.startsWith("//") ? path : "/";
  const origin = publicOrigin(headers, requestUrl);
  return origin ? `${origin}${safePath}` : safePath;
}

/** Origin for server-to-self requests (e.g. the PDF renderer fetching the print page). */
export function selfOrigin(headers: HeaderSource, requestUrl: string): string {
  return publicOrigin(headers, requestUrl) ?? new URL(requestUrl).origin;
}
