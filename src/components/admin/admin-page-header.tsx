"use client";

import { ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaMessage?: string;
  actions?: ReactNode;
};

export default function AdminPageHeader({
  title,
  description,
  ctaLabel,
  ctaHref,
  ctaMessage,
  actions,
}: Props) {
  const router = useRouter();

  const handleClick = useCallback(() => {
    if (!ctaLabel) {
      return;
    }

    if (ctaHref) {
      router.push(ctaHref);
      return;
    }

    toast.info(ctaMessage ?? "Bu özellik yakında kullanımda olacak.");
  }, [ctaHref, ctaLabel, ctaMessage, router]);

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.55)]/80 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-display tracking-[0.35em] text-[color:var(--color-turkish-blue-300)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 text-sm text-[rgba(255,255,255,0.7)]">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {actions}
        {ctaLabel ? (
          <button
            type="button"
            onClick={handleClick}
            className={cn(
              "relative inline-flex items-center justify-center rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-black",
              "bg-gradient-to-r from-[rgba(110,211,225,0.95)] via-[rgba(0,167,197,0.9)] to-[rgba(53,184,207,0.95)]",
              "shadow-[0_18px_45px_rgba(0,167,197,0.4)] transition hover:shadow-[0_22px_55px_rgba(0,167,197,0.5)]"
            )}
          >
            {ctaLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
