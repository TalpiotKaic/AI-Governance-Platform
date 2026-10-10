"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { hasInAppHistory } from "@/components/layout/nav-tracker";

/** Returns to the previous screen (browser history); falls back to `fallback` when no earlier app screen exists in this tab (opened directly or in a new tab). */
export function BackButton({ fallback }: { fallback: string }) {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <Button type="button" variant="outline" title={t("Back to the previous screen")}
      onClick={() => { if (hasInAppHistory()) router.back(); else router.push(fallback); }}>
      <ArrowLeft className="h-4 w-4" /> {t("Back")}
    </Button>
  );
}
