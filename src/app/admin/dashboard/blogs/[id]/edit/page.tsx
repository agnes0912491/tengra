import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { resolveAdminSessionToken } from "@/lib/auth";
import { getBlogById } from "@/lib/db";
import BlogEditor from "@/components/admin/blogs/blog-editor";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function EditBlogPage({ params }: Props) {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = resolveAdminSessionToken((name) => cookieStore.get(name)?.value);

    if (!token) {
        redirect("/admin/login");
    }

    const blog = await getBlogById(id);

    if (!blog) {
        notFound();
    }

    return <BlogEditor mode="edit" initialBlog={blog} />;
}
