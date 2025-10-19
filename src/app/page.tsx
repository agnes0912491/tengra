export const dynamic = "force-dynamic";

import HomePage from "@/components/home/home-page";
import Footer from "@/components/layout/footer";
import AnimatedWrapper from "@/components/ui/animated-wrapper";
import IntlProviderClient from "@/components/providers/intl-provider-client";
import { getMessages } from "@/i18n/get-messages";
import { routing } from "@/i18n/routing";

export default function IndexPage() {
  const { locale, messages } = getMessages(routing.defaultLocale);
  return (
    <IntlProviderClient locale={locale} messages={messages}>
      <main className="relative flex min-h-screen flex-col pb-32 pt-10">
        <AnimatedWrapper>
          <HomePage />
        </AnimatedWrapper>
      </main>
      <Footer />
    </IntlProviderClient>
  );
}
