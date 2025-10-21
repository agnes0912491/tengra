"use client";

import { NextIntlClientProvider } from "next-intl";

type Props = {
  locale: string;
  messages: Record<string, unknown>;
  children: React.ReactNode;
};

export default function IntlProviderClient({
  locale,
  messages,
  children,
}: Props) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
    >
      {children}
    </NextIntlClientProvider>
  );
}
