"use client";
import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";

/** Submit button that asks for confirmation first (for destructive server-action forms). */
export function ConfirmButton({ message, ...props }: ComponentProps<typeof Button> & { message: string }) {
  return <Button type="submit" {...props} onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }} />;
}
