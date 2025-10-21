import BlogsPageClient from "@/app/blogs/blogs-page-client";
import SiteShell from "@/components/layout/site-shell";

export default function BlogsPage() {
  return (
    <SiteShell>
      <BlogsPageClient />
    </SiteShell>
  );
}
