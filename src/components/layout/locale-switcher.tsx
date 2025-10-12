"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";

import { isLocale, routing, type Locale } from "@/i18n/routing";

const localeOptions: Locale[] = [...routing.locales];

function getLocalizedPath(pathname: string, targetLocale: Locale) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length > 0 && isLocale(segments[0])) {
    if (targetLocale === routing.defaultLocale) {
      segments.shift();
    } else {
      segments[0] = targetLocale;
    }
  } else if (targetLocale !== routing.defaultLocale) {
    segments.unshift(targetLocale);
  }

  const nextPath = segments.length > 0 ? `/${segments.join("/")}` : "/";
  return nextPath;
}

export default function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations("LocaleSwitcher");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (newLocale: Locale) => {
    if (newLocale === locale) return;

    const basePath = getLocalizedPath(pathname ?? "/", newLocale);
    const query = searchParams?.toString();
    const nextPath = query ? `${basePath}?${query}` : basePath;

    // Persist preferred locale for future visits to '/'
    Cookies.set("NEXT_LOCALE", newLocale, { path: "/", expires: 365 });

    startTransition(() => {
      router.push(nextPath);
      router.refresh();
    });
  };

  return (
    <label className="flex items-center gap-2 text-xs text-[rgba(255,255,255,0.6)]">
      <span>{t("label")}</span>
      <select
        className="rounded-md border border-[rgba(0,167,197,0.4)] bg-[rgba(3,12,18,0.8)] px-2 py-1 text-[0.7rem] uppercase tracking-[0.2em] text-[color:var(--color-turkish-blue-200)] focus:outline-none"
        value={locale}
        onChange={(event) => handleChange(event.target.value as Locale)}
        disabled={isPending}
      >
        {localeOptions.map((option) => (
          <option
            key={option}
            value={option}
            className="bg-[rgba(3,12,18,1)] text-white"
          >
            {t(option)}
          </option>
        ))}
      </select>
    </label>
  );
}
