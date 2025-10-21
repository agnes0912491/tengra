import AdminPageHeader from "@/components/admin/admin-page-header";
import BlogsTable from "@/components/admin/blogs/blogs-table";
import { getAllBlogs } from "@/lib/db";

export default async function AdminBlogsPage() {
  const blogs = await getAllBlogs().catch(() => []);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Bloglar"
        description="Stüdyonun hikayelerini ve araştırmalarını buradan yönetin."
        ctaLabel="Yeni Yazı"
        ctaMessage="Yeni blog yazısı oluşturma yakında hazır olacak."
      />
      <BlogsTable blogs={blogs} />
    </div>
  );
}
