"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { remark } from "remark";
import remarkHtml from "remark-html";

import { getBlogById, incrementBlogView } from "@/lib/db";
import type { Blog } from "@/types/blog";
import { generateSEO } from "@/lib/seo";
import { safeJsonLd } from "@/lib/jsonld";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

type BlogPostProps = {
  postId: string;
};

export default function BlogPost({ postId }: BlogPostProps) {
  const router = useRouter();
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

  const blogHomeHref = `/blogs`;

  const [renderHtml, setRenderHtml] = useState<string>("");

  useEffect(() => {
    if (!post) return;
    // Increment blog view count (fire-and-forget)
    try {
      incrementBlogView(post.id).catch(() => { });
    } catch { }
    const run = async () => {
      const raw = post.content || "";
      const looksLikeHtml = /<[^>]+>/.test(raw);
      if (looksLikeHtml) {
        setRenderHtml(raw);
      } else {
        try {
          const file = await remark().use(remarkHtml).process(raw);
          setRenderHtml(String(file));
        } catch {
          setRenderHtml(raw);
        }
      }
    };
    run();
  }, [post]);

  if (!post) return null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            generateSEO({
              title: post.title,
              description: post.excerpt,
              image: post.image,
              author: post.author,
              type: "article",
              url: `${BASE_URL}/blogs/${post.id}`,
              createdAt: post.createdAt,
            })
          ),
        }}
      />

      <article className="relative mx-auto max-w-5xl px-6 md:px-10 py-14 md:py-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,167,197,0.14)_0%,transparent_70%)] blur-3xl" />
        </div>

        <Link
          href={blogHomeHref}
          className="inline-block mb-6 text-sm text-[color:var(--color-turkish-blue-300)] hover:text-[color:var(--color-turkish-blue-100)] transition"
        >
          {t("backToBlogs")}
        </Link>

        <div className="overflow-hidden rounded-2xl border border-[rgba(0,167,197,0.18)] bg-[rgba(5,18,24,0.6)] shadow-[0_0_40px_rgba(0,167,197,0.06)] backdrop-blur-xl">
          {post.image ? (
            <div className="relative h-72 w-full md:h-[380px]">
              <Image crossOrigin="anonymous"
                src={post.image}
                alt={post.title}
                className="h-full w-full object-cover opacity-90"
                width={1600}
                height={900}
                priority
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,18,24,0.1),rgba(5,18,24,0.75))]" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h1 className="font-display text-3xl md:text-4xl tracking-wide text-[color:var(--color-turkish-blue-200)] drop-shadow-[0_0_18px_rgba(0,167,197,0.35)]">
                  {post.title}
                </h1>
                {post.createdAt && (
                  <p className="mt-2 text-xs uppercase tracking-widest text-[rgba(255,255,255,0.6)]">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 md:p-8">
              <h1 className="font-display text-3xl md:text-4xl tracking-wide text-[color:var(--color-turkish-blue-200)]">
                {post.title}
              </h1>
            </div>
          )}

          <div className="prose prose-invert prose-h2:mt-10 prose-h2:text-[color:var(--color-turkish-blue-200)] prose-strong:text-[rgba(255,255,255,0.95)] max-w-none p-6 md:p-10 text-[rgba(255,255,255,0.85)]">
            <div
              className="leading-relaxed [&_p]:my-4 [&_a]:text-[color:var(--color-turkish-blue-300)] [&_a:hover]:text-[color:var(--color-turkish-blue-100)] [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_img]:rounded-lg"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderHtml) }}
            />
          </div>
        </div>
      </article>
    </>
  );
}
