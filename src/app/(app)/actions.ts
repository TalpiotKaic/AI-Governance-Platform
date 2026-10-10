"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { UI_MODE_COOKIE } from "@/lib/ui-mode";

export async function setUiModeAction(mode: string) {
  await requireUser();
  (await cookies()).set(UI_MODE_COOKIE, mode === "expert" ? "expert" : "simple", { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/", "layout");
}
