// Simple / expert navigation. Simple mode hides the specialist evaluation-design screens; everything stays reachable by URL
// and the one-click recommended evaluation covers the common case.
export type UiMode = "simple" | "expert";
export const UI_MODE_COOKIE = "kveriai_mode";
export const SIMPLE_HIDDEN = ["/plans", "/library"];
export const hiddenInMode = (mode: UiMode, href: string) => mode === "simple" && SIMPLE_HIDDEN.includes(href);
export const defaultUiMode = (role: string): UiMode => (role === "ADMIN" || role === "TESTER" ? "expert" : "simple");
