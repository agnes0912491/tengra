import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import { getAllBlogs } from "@/lib/db";

import { BlogsClient } from "./_components/blogs-client";

export default async function BlogsPage() {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  const posts = await getAllBlogs(token);

  return (
    <section className="min-h-screen py-24 px-6 md:px-20">
      <h1 className="text-4xl text-center mb-12 text-[color:var(--color-turkish-blue-400)] font-display tracking-[0.25em]">
        BLOGS
      </h1>

      <BlogsClient posts={posts} />
    </section>
  );
}
