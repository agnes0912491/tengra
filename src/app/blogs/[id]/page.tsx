import SiteShell from "@/components/layout/site-shell";
import BlogPost from "@/components/blog/blog-post";

type BlogPostPageProps = {
  params: { id: string };
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { id } = await params;
  return (
    <SiteShell>
      <BlogPost postId={id} />
    </SiteShell>
  );
}
