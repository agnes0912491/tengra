import { ReactNode } from "react";
import { cookies, headers } from "next/headers";

import IntlProviderClient from "@/components/providers/intl-provider-client";
import { getMessages } from "@/i18n/get-messages";
import { isLocale, routing } from "@/i18n/routing";

type Props = {
  children: ReactNode;
};

function resolvePreferredLocale() {
  const localeCookie = cookies().get("NEXT_LOCALE")?.value;
  if (localeCookie && isLocale(localeCookie)) {
    return localeCookie;
  }

  const acceptLanguage = headers().get("accept-language") ?? "";
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

export default function AdminLayout({ children }: Props) {
  const preferredLocale = resolvePreferredLocale();
  const { locale, messages } = getMessages(preferredLocale);

  return (
    <IntlProviderClient locale={locale} messages={messages}>
      {children}
    </IntlProviderClient>
  );
}
