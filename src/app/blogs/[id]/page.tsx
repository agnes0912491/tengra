import SiteShell from "@/components/layout/site-shell";
import BlogPost from "@/components/blog/blog-post";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/page-metadata";

type BlogPostPageProps = {
  params: { id: string };
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  return buildPageMetadata({
    title: "Blog Post | Tengra Studio",
    description: "A detailed article from the Tengra Studio team.",
    path: `/blogs/${params.id}`,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { id } = await params;
  return (
    <SiteShell>
      <BlogPost postId={id} />
    </SiteShell>
  );
}
