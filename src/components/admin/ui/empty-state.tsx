"use client";

import { useTranslations } from "next-intl";

export default function EmptyState({ message }: { message?: string }) {
  const t = useTranslations("AdminCommon");
  const resolvedMessage = message ?? t("empty");
  return (
    <div className="rounded-2xl border border-dashed border-[rgba(110,211,225,0.2)] bg-[rgba(6,20,27,0.45)]/60 px-4 py-6 text-center text-[rgba(255,255,255,0.6)]">
      {resolvedMessage}
    </div>
  );
}
