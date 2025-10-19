import HomePage from "@/components/home/home-page";
import { resolveLocale, routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

export default function LocaleHomePage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = resolveLocale(params?.locale);
  if (!locale) {
    notFound();
  }
  return <HomePage />;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
