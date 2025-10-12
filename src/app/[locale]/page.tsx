import HomePage from "@/components/home/home-page";
import { routing, isLocale } from "@/i18n/routing";
import { notFound } from "next/navigation";

type PageProps = {
  params: { locale?: string };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default function LocaleHomePage({ params }: PageProps) {
  const localeParam = params.locale;

  if (!localeParam || !isLocale(localeParam)) {
    notFound();
  }

  return <HomePage />;
}
