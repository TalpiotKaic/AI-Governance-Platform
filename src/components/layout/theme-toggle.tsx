"use client";
import { useI18n } from "@/lib/i18n/client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { t } = useI18n();
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Sync from the class the inline <head> script already applied (external system → React state).
    const id = requestAnimationFrame(() => { setDark(document.documentElement.classList.contains("dark")); setMounted(true); });
    return () => cancelAnimationFrame(id);
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("kveriai-theme", next ? "dark" : "light"); } catch {}
  }
  return (
    <button onClick={toggle} className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-foreground" title={t("Toggle theme")} type="button">
      {mounted && dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
