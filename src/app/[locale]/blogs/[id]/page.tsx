import BlogPost from "@/components/blog/blog-post";
import { resolveLocale } from "@/i18n/routing";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default function LocaleBlogPost({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const locale = resolveLocale(params?.locale);
  if (!locale) {
    notFound();
  }

  return <BlogPost postId={params.id} />;
}

