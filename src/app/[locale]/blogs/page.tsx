import BlogsPageClient from "@/app/blogs/blogs-page-client";
import { resolveLocale, routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

export default async function LocaleBlogsPage({
  params,
}: {
  params: { locale: string };
}) {
  const awaitedParams = await params;
  const locale = resolveLocale(awaitedParams?.locale);

  if (!locale) {
    notFound();
  }

  return <BlogsPageClient />;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
