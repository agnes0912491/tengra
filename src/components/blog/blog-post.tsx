"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Metadata } from "next";
import { useRouter } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";

import { getBlogById } from "@/lib/db";
import type { Blog } from "@/types/blog";
import { generateSEO } from "@/lib/seo";
import { safeJsonLd } from "@/lib/jsonld";
import { routing } from "@/i18n/routing";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

type BlogPostProps = {
  postId: string;
};

export default function BlogPost({ postId }: BlogPostProps) {
  const router = useRouter();
  const locale = useLocale() as (typeof routing.locales)[number];
  const t = useTranslations("common");
  const [post, setPost] = useState<Blog | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      const data = await getBlogById(postId);
      setPost(data);
    };
    fetchPost();
  }, [postId]);

  useEffect(() => {
    if (post === null) {
      router.push("/404");
    }
  }, [post, router]);

  if (!post) return null;

  const blogHomeHref = `/${locale}/blogs`;

  const metadata: Metadata = generateSEO({
    title: post.title,
    description: post.excerpt,
    image: post.image,
    author: post.author,
    type: "article",
    url: `${BASE_URL}/${locale}/blogs/${post.id}`,
    createdAt: post.createdAt,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(metadata),
        }}
      />

      <article className="min-h-screen py-20 px-6 md:px-40 max-w-5xl mx-auto">
        <Link
          href={blogHomeHref}
          className="inline-block mb-6 text-sm text-[color:var(--color-turkish-blue-300)] hover:text-[color:var(--color-turkish-blue-100)] transition"
        >
          {t("backToBlogs")}
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
        <p className="text-gray-400 text-sm mb-8"></p>
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
