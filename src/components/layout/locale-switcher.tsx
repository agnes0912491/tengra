"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { routing, type Locale } from "@/i18n/routing";

const localeOptions: Locale[] = [...routing.locales];

export default function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations("LocaleSwitcher");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (newLocale: Locale) => {
    if (newLocale === locale) return;

    // Persist preferred locale for future visits to '/'
    Cookies.set("NEXT_LOCALE", newLocale, { path: "/", expires: 365 });

    startTransition(() => {
      router.refresh();
    });
  };

  const flag = (loc: Locale) => (loc === "tr" ? "🇹🇷" : "🇬🇧");
  const label = (loc: Locale) => (loc === "tr" ? "Türkçe" : "English");

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-[rgba(0,167,197,0.35)] bg-[rgba(3,12,18,0.6)] px-3 py-1.5 text-xs text-white hover:bg-[rgba(0,167,197,0.12)]"
          disabled={isPending}
          aria-label={t("label")}
        >
          <span className="text-lg leading-none">{flag(locale)}</span>
          <span className="uppercase tracking-[0.25em] text-[color:var(--color-turkish-blue-200)]">{locale}</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="z-50 min-w-[160px] rounded-xl border border-[rgba(0,167,197,0.25)] bg-[rgba(6,18,24,0.95)] p-1 text-sm text-white shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        {localeOptions.map((loc) => (
          <DropdownMenu.Item
            key={loc}
            onSelect={() => handleChange(loc)}
            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 outline-none data-[highlighted]:bg-[rgba(0,167,197,0.15)]"
          >
            <span className="text-xl leading-none">{flag(loc)}</span>
            <div className="flex flex-col">
              <span className="text-white">{label(loc)}</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[rgba(255,255,255,0.6)]">{loc}</span>
            </div>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
