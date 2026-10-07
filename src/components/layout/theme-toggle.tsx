"use client";
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

export type ThemePref = "light" | "dark" | "system";
const STORAGE_KEY = "kveriai-theme";

function readPref(): ThemePref {
  try { const v = localStorage.getItem(STORAGE_KEY); if (v === "light" || v === "dark" || v === "system") return v; } catch {}
  return "system";
}
function systemDark() { return window.matchMedia("(prefers-color-scheme: dark)").matches; }
function persist(pref: ThemePref) {
  try { localStorage.setItem(STORAGE_KEY, pref); } catch {}
  try { document.cookie = `${STORAGE_KEY}=${pref}; path=/; max-age=31536000; samesite=lax`; } catch {}
}
function apply(pref: ThemePref) {
  const dark = pref === "dark" || (pref === "system" && systemDark());
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

/**
 * Light / Dark / System selector. The preference lives in localStorage (read by the inline
 * <head> script before paint) and in a cookie so the server can render the right class on
 * the first response. Always rendered with the same markup server- and client-side.
 */
export function ThemeToggle({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { t } = useI18n();
  const [pref, setPref] = useState<ThemePref>("system");
  useEffect(() => {
    const id = requestAnimationFrame(() => setPref(readPref()));
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => { if (readPref() === "system") apply("system"); };
    mq.addEventListener("change", onChange);
    return () => { cancelAnimationFrame(id); mq.removeEventListener("change", onChange); };
  }, []);
  function choose(next: ThemePref) {
    setPref(next);
    apply(next);
    persist(next);
  }
  const options: { value: ThemePref; label: string; Icon: typeof Sun }[] = [
    { value: "light", label: t("Light"), Icon: Sun },
    { value: "dark", label: t("Dark"), Icon: Moon },
    { value: "system", label: t("System"), Icon: Monitor },
  ];
  return (
    <div role="radiogroup" aria-label={t("Theme")} title={t("Theme")} className={cn("flex items-center gap-0.5 rounded-md border border-border p-0.5", className)}>
      {options.map(({ value, label, Icon }) => (
        <button key={value} type="button" role="radio" aria-checked={pref === value} aria-label={label} title={label} onClick={() => choose(value)}
          className={cn("inline-flex h-7 items-center gap-1.5 rounded px-2 text-xs font-medium transition-colors", pref === value ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground")}>
          <Icon className="h-3.5 w-3.5" />
          {!compact && <span className="hidden lg:inline">{label}</span>}
        </button>
      ))}
    </div>
  );
}
