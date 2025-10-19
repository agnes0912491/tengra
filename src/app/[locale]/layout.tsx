import Footer from "@/components/layout/footer";
import IntlProviderClient from "@/components/providers/intl-provider-client";
import AnimatedWrapper from "@/components/ui/animated-wrapper";
import { getMessages } from "@/i18n/get-messages";
import { resolveLocale } from "@/i18n/routing";
import { notFound } from "next/navigation";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const awaitedParams = await params;
  const locale = resolveLocale(awaitedParams?.locale);
  if (!locale) {
    notFound();
  }

  const { messages } = getMessages(locale);

  return (
    <IntlProviderClient locale={locale} messages={messages}>
      <main className="relative flex min-h-screen flex-col pb-32 pt-10">
        <AnimatedWrapper>{children}</AnimatedWrapper>
      </main>
      <Footer />
    </IntlProviderClient>
  );
}
