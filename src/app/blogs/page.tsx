import { cookies } from "next/headers";

import { getAllBlogs, getAllBlogCategories } from "@/lib/db";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import BlogsClient from "./BlogsClient";

export default async function BlogsPage() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const categories = await getAllBlogCategories();
  const posts = await getAllBlogs(token);

  return <BlogsClient posts={posts} categories={categories} token={token} />;

}
