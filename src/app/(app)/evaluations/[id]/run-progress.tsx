"use client";
import { useI18n } from "@/lib/i18n/client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";

export function RunProgress({ status, progress }: { status: string; progress: number }) {
  const { t } = useI18n();
  const router = useRouter();
  const active = status === "RUNNING" || status === "QUEUED";
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => router.refresh(), 2000);
    return () => clearInterval(t);
  }, [active, router]);
  if (!active) return null;
  return (
    <div className="mb-4 rounded-md border border-info/40 bg-info-soft/40 px-4 py-3">
      <div className="mb-1 flex items-center justify-between text-sm"><span className="font-medium">{status === "QUEUED" ? t("Queued…") : t("Running evaluation…")}</span><span className="tabular-nums text-muted">{progress}%</span></div>
      <Progress value={progress} />
      <p className="mt-1 text-xs text-muted">{t("Sessions are executed, annotated and scored in the background. This page refreshes automatically.")}</p>
    </div>
  );
}
