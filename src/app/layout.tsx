import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { getLocale } from "@/lib/i18n/server";
import { LocaleProvider } from "@/lib/i18n/client";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "K-VeriAI", template: "%s · K-VeriAI" },
  description: "AI Governance, Evaluation & Assurance Platform — model and agent evaluation, risk management, and evidence for ISO/IEC 42001, EU AI Act and NIST AI RMF.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const themeCookie = (await cookies()).get("kveriai-theme")?.value;
  const ssrDark = themeCookie === "dark";
  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased${ssrDark ? " dark" : ""}`} style={ssrDark ? { colorScheme: "dark" } : undefined} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('kveriai-theme');var d=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);var c=document.documentElement.classList;if(d){c.add('dark');document.documentElement.style.colorScheme='dark';}else{c.remove('dark');document.documentElement.style.colorScheme='light';}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col"><LocaleProvider locale={locale}>{children}</LocaleProvider></body>
    </html>
  );
}
