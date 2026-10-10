"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const KEY = "kveriai-nav-depth";

/** Counts in-app page views in this browser tab so a Back button knows whether an earlier app screen exists. */
export function NavTracker() {
  const pathname = usePathname();
  useEffect(() => {
    try { sessionStorage.setItem(KEY, String(Number(sessionStorage.getItem(KEY) ?? "0") + 1)); } catch { /* storage unavailable */ }
  }, [pathname]);
  return null;
}

export function hasInAppHistory(): boolean {
  try { return Number(sessionStorage.getItem(KEY) ?? "0") > 1; } catch { return false; }
}
