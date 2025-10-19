import { ReactNode } from "react";
import { cookies, headers } from "next/headers";

import IntlProviderClient from "@/components/providers/intl-provider-client";
import { getMessages } from "@/i18n/get-messages";
import { resolvePreferredLocale } from "@/i18n/resolve-preferred-locale";

type Props = {
  children: ReactNode;
};

export default function AdminLayout({ children }: Props) {
  const cookieStore = cookies();
  const headersList = headers();
  const { locale: preferredLocale } = resolvePreferredLocale({
    cookieLocale: cookieStore.get("NEXT_LOCALE")?.value,
    acceptLanguage: headersList.get("accept-language"),
  });
  const { locale, messages } = getMessages(preferredLocale);

  return (
    <IntlProviderClient locale={locale} messages={messages}>
      {children}
    </IntlProviderClient>
  );
}
