import { ReactNode } from "react";
import { cookies, headers } from "next/headers";

import IntlProviderClient from "@/components/providers/intl-provider-client";
import { getMessages } from "@/i18n/get-messages";
import { resolveLocale, routing } from "@/i18n/routing";

type Props = {
  children: ReactNode;
};

function resolvePreferredLocale() {
  const localeCookie = cookies().get("NEXT_LOCALE")?.value;
  const cookieLocale = resolveLocale(localeCookie);
  if (cookieLocale) {
    return cookieLocale;
  }

  const headersList = headers();
  const acceptLanguage = headersList.get("Accept-Language") || "";
  const candidates = acceptLanguage
    .split(",")
    .map((item) => item.trim().split(";")[0])
    .map((code) => code.toLowerCase().replace("_", "-"));

  for (const code of candidates) {
    if (!code) continue;

    const normalized = resolveLocale(code);
    if (normalized) {
      return normalized;
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
