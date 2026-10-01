"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession, verifyCredentials } from "@/lib/auth";

const schema = z.object({
  email: z.email(),
  password: z.string().min(1),
  next: z.string().optional(),
});

export type LoginState = { error?: string } | undefined;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });
  if (!parsed.success) return { error: "Enter a valid email and password." };
  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) return { error: "Invalid credentials." };
  await createSession(user.id);
  const next = parsed.data.next && parsed.data.next.startsWith("/") ? parsed.data.next : "/dashboard";
  redirect(next);
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
