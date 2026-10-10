"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";

/** Keep a control on automatic status, or record a manual exception with a reason. */
export function ControlExceptionForm({ action, auto, status, notes }: { action: (fd: FormData) => void | Promise<void>; auto: boolean; status: string; notes: string }) {
  const { t, L } = useI18n();
  const [mode, setMode] = useState(auto ? "AUTO" : status);
  const dirty = mode !== (auto ? "AUTO" : status);
  return (
    <form action={action} className="flex flex-wrap items-center gap-1">
      <Select name="status" value={mode} onChange={(e) => setMode(e.target.value)} className="h-7 w-36 text-xs">
        <option value="AUTO">{t("Automatic")}</option>
        {["NOT_APPLICABLE", "IMPLEMENTED", "IN_PROGRESS", "NOT_STARTED"].map((s) => <option key={s} value={s}>{t("Exception")}: {L(s)}</option>)}
      </Select>
      {mode !== "AUTO" && <Input name="notes" required defaultValue={auto ? "" : notes} placeholder={t("Reason (required)")} className="h-7 w-40 text-xs" />}
      <Button size="sm" variant="ghost" type="submit" disabled={!dirty && mode === "AUTO"}>{t("Save")}</Button>
    </form>
  );
}
