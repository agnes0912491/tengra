import BlogsPageClient from "@/app/blogs/blogs-page-client";
import SiteShell from "@/components/layout/site-shell";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Blogs | Tengra Studio",
  description: "Read updates, stories, and insights from Tengra Studio.",
  path: "/blogs",
});

export default function BlogsPage() {
  return (
    <SiteShell>
      <BlogsPageClient />
    </SiteShell>
  );
}
