import BlogsPageClient from "@/app/blogs/blogs-page-client";
import { resolveLocale, routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default function LocaleBlogsPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = resolveLocale(params?.locale);
  if (!locale) {
    notFound();
  }

  return <BlogsPageClient />;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
