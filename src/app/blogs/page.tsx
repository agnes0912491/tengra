import BlogsPageClient from "./blogs-page-client";
import IntlProviderClient from "@/components/providers/intl-provider-client";
import { getMessages } from "@/i18n/get-messages";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export default function BlogsPage() {
  const { locale, messages } = getMessages(routing.defaultLocale);

  return (
    <IntlProviderClient locale={locale} messages={messages}>
      <BlogsPageClient />
    </IntlProviderClient>
  );
}
