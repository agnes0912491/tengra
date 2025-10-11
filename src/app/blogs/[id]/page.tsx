import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import { getBlogById } from "@/lib/db";

export default async function BlogPost({
  params,
}: {
  params: { id: string };
}) {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const post = await getBlogById(params.id);

  if (!post) {
    notFound();
  }

  return (
    <article className="min-h-screen py-20 px-6 md:px-40 max-w-5xl mx-auto">
      <Link
        href="/blogs"
        className="inline-block mb-6 text-sm text-[color:var(--color-turkish-blue-300)] hover:text-[color:var(--color-turkish-blue-100)] transition"
      >
        ← Back
      </Link>

      <Image
        src={post.image}
        alt={post.title}
        className="rounded-xl mb-10 w-full h-72 object-cover opacity-90"
        width={1280}
        height={720}
        priority
      />
      <h1 className="text-4xl text-[color:var(--color-turkish-blue-400)] mb-2 font-display">
        {post.title}
      </h1>
      <p className="text-gray-400 text-sm mb-8">
        {post.date} · by {post.author}
      </p>
      <div
        className="text-gray-300 leading-relaxed space-y-6"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
