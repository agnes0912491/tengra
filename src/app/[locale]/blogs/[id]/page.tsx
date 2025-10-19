import BlogPost from "@/components/blog/blog-post";
import { resolveLocale } from "@/i18n/routing";
import { notFound } from "next/navigation";

export default async function LocaleBlogPostPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const awaitedParams = await params;
  const locale = resolveLocale(awaitedParams?.locale);

  if (!locale) {
    notFound();
  }

  return <BlogPost postId={awaitedParams.id} />;
}
