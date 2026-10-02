import "server-only";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { LOCALE_COOKIE, translate, type Locale } from "./dict";
import { labelFor } from "./labels";

export const getLocale = cache(async (): Promise<Locale> => {
  const store = await cookies();
  const c = store.get(LOCALE_COOKIE)?.value;
  if (c === "ko" || c === "en") return c;
  const accept = (await headers()).get("accept-language") ?? "";
  return accept.toLowerCase().startsWith("ko") ? "ko" : "en";
});

/** Server-side i18n helpers: t() for UI strings, L() for enum values. */
export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: (key: string) => translate(locale, key), L: (v: string | null | undefined) => labelFor(locale, v) };
}
