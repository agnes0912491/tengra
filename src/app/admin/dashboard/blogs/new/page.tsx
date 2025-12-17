import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { resolveAdminSessionToken } from "@/lib/auth";
import BlogEditor from "@/components/admin/blogs/blog-editor";

export default async function NewBlogPage() {
    const cookieStore = await cookies();
    const token = resolveAdminSessionToken((name) => cookieStore.get(name)?.value);

    if (!token) {
        redirect("/admin/login");
    }

    return <BlogEditor mode="create" />;
}
