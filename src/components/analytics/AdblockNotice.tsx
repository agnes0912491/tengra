"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@tengra/language";

/**
 * Renders a subtle, non-dismissible warning bar when adblock is detected.
 */
export default function AdblockNotice() {
  const [enabled, setEnabled] = useState(false);
  const { t } = useTranslation("AdblockNotice");

  useEffect(() => {
    const update = () => {
      if (typeof document === "undefined") return;
      const flag = document.documentElement.dataset.adblock;
      setEnabled(flag === "true");
    };
    update();
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ enabled?: boolean }>).detail;
      if (detail && typeof detail.enabled === "boolean") {
        setEnabled(detail.enabled);
      } else {
        update();
      }
    };
    window.addEventListener("tengra:adblock-detected", handler);
    return () => window.removeEventListener("tengra:adblock-detected", handler);
  }, []);

  if (!enabled) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-3 pb-4">
      <div className="flex w-full max-w-5xl items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(8,14,20,0.9)]/90 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[rgba(255,196,0,0.12)] text-[rgba(255,210,120,0.95)] border border-[rgba(255,196,0,0.28)]">
          !
        </span>
        <div className="flex flex-col text-sm text-[rgba(255,255,255,0.82)]">
          <span className="font-semibold tracking-[0.06em] text-white">{t("title")}</span>
          <span className="text-[rgba(255,255,255,0.7)]">
            {t("description")}
          </span>
        </div>
      </div>
    </div>
  );
}
