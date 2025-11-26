"use client";

import { useEffect, useState } from "react";
import { getFaqs, type FaqItem } from "@/lib/db";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export default function FaqSection() {
  const locale = useLocale();
  const tNav = useTranslations("Navigation");
  const [items, setItems] = useState<FaqItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const list = await getFaqs(locale).catch(() => []);
      if (mounted) setItems(list);
    })();
    return () => {
      mounted = false;
    };
  }, [locale]);

  if (!items.length) return null;

  return (
    <section className="relative py-24 px-6 md:px-20">
      <h2 className="section-title neon-text text-center">{tNav("faq")}</h2>
      <div className="w-16 h-[1px] mx-auto mt-3 mb-10 bg-[rgba(0,167,197,0.4)]" />
      <div className="mx-auto w-full space-y-3">
        {items.map((it) => (
          <div key={it.id} className="rounded-2xl border border-[rgba(110,211,225,0.18)] bg-[rgba(8,28,38,0.55)]/80 backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setOpenId((p) => (p === it.id ? null : it.id))}
              className={cn(
                "flex w-full items-center justify-between px-5 py-4 text-left",
                openId === it.id ? "text-[color:var(--color-turkish-blue-200)]" : "text-white"
              )}
            >
              <span className="font-semibold">{it.question}</span>
              <span className="text-sm opacity-70">{openId === it.id ? "−" : "+"}</span>
            </button>
            <div className={cn("px-5 pb-5 text-[rgba(255,255,255,0.8)]", openId === it.id ? "block" : "hidden")}>{it.answer}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
