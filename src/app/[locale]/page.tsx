import HomePage from "@/components/home/home-page";
import { isLocale } from "@/i18n/routing";
import { notFound } from "next/navigation";

export default function LocaleHomePage({
  params,
}: {
  params: { locale: string };
}) {
  const localeParam = params?.locale;
  if (!localeParam || !isLocale(localeParam)) {
    notFound();
  }
  return <HomePage />;
}
