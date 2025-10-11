"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import { mockBlogs } from "@/lib/mockBlogs";
import Image from "next/image";

export default function BlogPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const post = mockBlogs.find((p) => p.id === resolvedParams.id);

  if (!post)
    return (
      <div className="text-center py-20 text-gray-400">Post not found.</div>
    );

  return (
    <article className="min-h-screen py-20 px-6 md:px-40 max-w-5xl mx-auto">
      <button
        onClick={() => router.back()}
        className="inline-block mb-6 text-sm text-[color:var(--color-turkish-blue-300)] hover:text-[color:var(--color-turkish-blue-100)] transition"
      >
        ← Back
      </button>

      <Image
        src={post.image}
        alt={post.title}
        className="rounded-xl mb-10 w-full h-72 object-cover opacity-90"
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
