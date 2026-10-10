import { cookies } from "next/headers";
import { UI_MODE_COOKIE, defaultUiMode, type UiMode } from "@/lib/ui-mode";

export async function getUiMode(role: string): Promise<UiMode> {
  const v = (await cookies()).get(UI_MODE_COOKIE)?.value;
  return v === "simple" || v === "expert" ? v : defaultUiMode(role);
}
