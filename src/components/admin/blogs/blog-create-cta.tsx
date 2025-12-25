"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "@tengra/language";

export default function BlogCreateCta() {
  const { t } = useTranslation("AdminBlogs");
  return (
    <Link
      href="/admin/dashboard/blogs"
      className={cn(
        "relative inline-flex items-center justify-center rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-black",
        "bg-gradient-to-r from-[rgba(110,211,225,0.95)] via-[rgba(0,167,197,0.9)] to-[rgba(53,184,207,0.95)]",
        "shadow-[0_18px_45px_rgba(0,167,197,0.4)] transition hover:shadow-[0_22px_55px_rgba(0,167,197,0.5)]"
      )}
    >
      {t("createCta.label")}
    </Link>
  );
}
