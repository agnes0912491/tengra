import AdminPageHeader from "@/components/admin/admin-page-header";
import BlogStudio from "@/components/admin/blogs/blog-studio";
import { getAllBlogs } from "@/lib/db";

export default async function AdminBlogsPage() {
  const blogs = await getAllBlogs().catch(() => []);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Bloglar"
        description="Stüdyonun hikayelerini ve araştırmalarını buradan yönetin."
      />
      <BlogStudio initialBlogs={blogs} />
    </div>
  );
}
