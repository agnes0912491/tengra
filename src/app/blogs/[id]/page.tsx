"use client";

import Image from "next/image";
import Link from "next/link"; 
import { getBlogById } from "@/lib/db";
import { useAuth } from "@/components/providers/auth-provider"; 
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useState } from "react";
import type { Blog } from "@/types/blog";

export const generateMetadata = (post: Blog) => ({
  title: `${post.title} | TENGRA`,
  description: post.excerpt,
  openGraph: {
    images: [post.image],
  },
  other: {
    "article:published_time": post.createdAt,
    "article:author": post.author,
  },
});

export default function BlogPost({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
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
    return router.push('/404');
  }

  return (
    <>
      {post && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.title,
              image: post.image,
              author: { "@type": "Person", name: post.author },
              publisher: { "@type": "Organization", name: "TENGRA Studio" },
              datePublished: post.createdAt,
              description: post.excerpt,
            }),
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
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
    </>
  );
}
