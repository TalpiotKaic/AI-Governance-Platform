"use client";
import { createContext, useContext } from "react";
import { translate, type Locale } from "./dict";
import { labelFor } from "./labels";

const LocaleContext = createContext<Locale>("en");

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const locale = useContext(LocaleContext);
  return { locale, t: (key: string) => translate(locale, key), L: (v: string | null | undefined) => labelFor(locale, v) };
}
