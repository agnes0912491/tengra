import Footer from "@/components/layout/footer";
import IntlProviderClient from "@/components/providers/intl-provider-client";
import AnimatedWrapper from "@/components/ui/animated-wrapper";
import { ToastContainer } from "react-toastify";
import { getMessages } from "@/i18n/get-messages";
import { isLocale, type Locale } from "@/i18n/routing";
import { notFound } from "next/navigation";

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const localeParam = params?.locale;
  if (!localeParam || !isLocale(localeParam)) {
    notFound();
  }

  const { locale, messages } = getMessages(localeParam as Locale);

  return (
    <IntlProviderClient locale={locale} messages={messages}>
      <main className="relative flex min-h-screen flex-col pb-32 pt-10">
        <AnimatedWrapper>{children}</AnimatedWrapper>
      </main>
      <Footer />
      <ToastContainer position="bottom-right" theme="dark" />
    </IntlProviderClient>
  );
}
