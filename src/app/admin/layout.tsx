import { ReactNode } from "react";
import { headers } from "next/headers";

import IntlProviderClient from "@/components/providers/intl-provider-client";
import { getMessages } from "@/i18n/get-messages";
import { isLocale, routing } from "@/i18n/routing";
import Cookies from "js-cookie";

type Props = {
  children: ReactNode;
};

async function resolvePreferredLocale() {
  const localeCookie = Cookies.get("NEXT_LOCALE");
  if (localeCookie && isLocale(localeCookie)) {
    return localeCookie;
  }

  const headersList = await headers();
  const acceptLanguage = headersList.get("Accept-Language") || "";
  const supported = routing.locales as readonly string[];
  const candidates = acceptLanguage
    .split(",")
    .map((item) => item.trim().split(";")[0])
    .map((code) => code.toLowerCase().replace("_", "-"));

  for (const code of candidates) {
    if (!code) continue;
    const exactMatch = supported.find((locale) => locale.toLowerCase() === code);
    if (exactMatch) {
      return exactMatch;
    }

    const base = code.split("-")[0];
    const baseMatch = supported.find((locale) => locale.toLowerCase() === base);
    if (baseMatch) {
      return baseMatch;
    }
  }

  return routing.defaultLocale;
}

export default async function AdminLayout({ children }: Props) {
  const preferredLocale = await resolvePreferredLocale();
  const { locale, messages } = getMessages(preferredLocale);

  return (
    <IntlProviderClient locale={locale} messages={messages}>
      {children}
    </IntlProviderClient>
  );
}
