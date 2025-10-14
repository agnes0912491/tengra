"use client";

import Image from "next/image";
import Link from "next/link";
import { getBlogById } from "@/lib/db";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useState } from "react";
import type { Blog } from "@/types/blog";
import { generateSEO } from "@/lib/seo";
import { Metadata } from "next";
import DOMPurify from "isomorphic-dompurify";
import { safeJsonLd } from "@/lib/jsonld";

const BASE_URL = "https://tengra.studio";

export default function BlogPost({ params }: { params: { id: string } }) {
  const router = useRouter();

  const [post, setPost] = useState<Blog | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      const data = await getBlogById(params.id);
      setPost(data);
    };

    fetchPost();
  }, [params.id]);

  if (!post) {
    return router.push("/404");
  }

  const metadata: Metadata = generateSEO({
    title: post.title,
    description: post.excerpt,
    image: post.image,
    author: post.author,
    type: "article",
    url: `${BASE_URL}/blogs/${post.id}`,
    createdAt: post.createdAt,
  });

  return (
    <>
      {post && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(metadata),
          }}
        />
      )}

      <article className="min-h-screen py-20 px-6 md:px-40 max-w-5xl mx-auto">
        <Link
          href="/blogs"
          className="inline-block mb-6 text-sm text-[color:var(--color-turkish-blue-300)] hover:text-[color:var(--color-turkish-blue-100)] transition"
        >
          ← Back
        </Link>

        <Image
          src={post?.image}
          alt={post?.title}
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
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(post.content || ""),
          }}
        />
      </article>
    </>
  );
}
