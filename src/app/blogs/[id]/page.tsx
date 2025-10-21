import SiteShell from "@/components/layout/site-shell";
import BlogPost from "@/components/blog/blog-post";

type BlogPostPageProps = {
  params: { id: string };
};

export default function BlogPostPage({ params }: BlogPostPageProps) {
  return (
    <SiteShell>
      <BlogPost postId={params.id} />
    </SiteShell>
  );
}
