"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { Calendar, Clock, Share2, ArrowLeft, ExternalLink, Eye, BookOpen } from "lucide-react";
import LikeButton from "./LikeButton";

import { getBlogById, incrementBlogView } from "@/lib/db";
import type { Blog } from "@/types/blog";
import { generateSEO } from "@/lib/seo";
import { safeJsonLd } from "@/lib/jsonld";
import { cn, slugify } from "@/lib/utils";
import { resolveCdnUrl } from "@/lib/constants";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

type TocItem = {
  id: string;
  title: string;
  level: number;
};

const buildTocFromContent = (content: string): TocItem[] => {
  const lines = content.split("\n");
  const items: TocItem[] = [];
  lines.forEach((line) => {
    const match = /^(#{1,3})\s+(.*)/.exec(line.trim());
    if (!match) return;
    const level = match[1].length;
    const text = match[2].replace(/#/g, "").trim();
    const id = slugify(text);
    if (text && id) {
      items.push({ id, title: text, level });
    }
  });
  return items.slice(0, 20);
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

type BlogPostProps = {
  postId: string;
};

export default function BlogPost({ postId }: BlogPostProps) {
  const router = useRouter();
  const t = useTranslations("common");
  const [post, setPost] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [renderHtml, setRenderHtml] = useState<string>("");
  const [toc, setToc] = useState<TocItem[]>([]);
  const [notFound, setNotFound] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPost = async () => {
      setLoading(true);
      try {
        const data = await getBlogById(postId);
        if (!isMounted) return;
        if (!data) {
          setNotFound(true);
          return;
        }
        setPost(data);
        setToc(buildTocFromContent(data.content || ""));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPost();
    return () => {
      isMounted = false;
    };
  }, [postId]);

  useEffect(() => {
    if (!post) return;
    const run = async () => {
      try {
        const raw = post.content || "";
        const looksLikeHtml = post.format === "html" || /<[^>]+>/.test(raw);
        if (post.contentHtml) {
          setRenderHtml(post.contentHtml);
        } else if (looksLikeHtml) {
          setRenderHtml(raw);
        } else {
          const file = await remark().use(remarkHtml).process(raw);
          setRenderHtml(String(file));
        }
      } catch {
        setRenderHtml(post.content);
      }
    };
    run();

    try {
      incrementBlogView(post.id).catch(() => undefined);
    } catch {
      // ignore
    }
  }, [post]);

  useEffect(() => {
    if (!contentRef.current) return;
    const headings = contentRef.current.querySelectorAll("h1, h2, h3");
    headings.forEach((node) => {
      const text = node.textContent ?? "";
      const id = slugify(text);
      if (id) node.id = id;
    });
  }, [renderHtml]);

  const pageUrl = useMemo(() => {
    const slug = post?.slug ?? post?.id ?? postId;
    return `${BASE_URL}/blogs/${slug}`;
  }, [post, postId]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-center text-[rgba(255,255,255,0.7)]">
        <p className="text-lg">Aradığınız içerik bulunamadı.</p>
        <button
          onClick={() => router.push("/blogs")}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[rgba(72,213,255,0.2)] px-4 py-2 text-sm font-semibold text-[rgba(130,226,255,0.95)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Bloga dön
        </button>
      </div>
    );
  }

  if (loading || !post) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="h-6 w-32 animate-pulse rounded bg-[rgba(255,255,255,0.08)]" />
        <div className="mt-4 h-10 w-3/4 animate-pulse rounded bg-[rgba(255,255,255,0.08)]" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-[rgba(255,255,255,0.05)]" />
      </div>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            generateSEO({
              title: post.seo?.title ?? post.title,
              description: post.seo?.description ?? post.excerpt,
              image: post.image || post.heroImage,
              author: post.author,
              type: "article",
              url: pageUrl,
              createdAt: post.createdAt,
            })
          ),
        }}
      />

      <article className="relative mx-auto max-w-5xl px-6 py-14 md:px-10 md:py-20">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,167,197,0.12)_0%,transparent_70%)] blur-3xl" />
        </div>

        <div className="mb-6 flex items-center justify-between text-sm text-[rgba(255,255,255,0.65)]">
          <button
            onClick={() => router.push("/blogs")}
            className="inline-flex items-center gap-2 text-[rgba(130,226,255,0.95)] hover:text-[rgba(255,255,255,0.9)]"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToBlogs")}
          </button>
          {post.status && (
            <span className="rounded-full bg-[rgba(72,213,255,0.16)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(130,226,255,0.95)]">
              {post.status}
            </span>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-[rgba(0,167,197,0.18)] bg-[rgba(5,18,24,0.6)] shadow-[0_0_40px_rgba(0,167,197,0.06)] backdrop-blur-xl">
          {post.image ? (
            <div className="relative h-72 w-full md:h-[380px]">
              <Image
                crossOrigin="anonymous"
                src={resolveCdnUrl(post.image)}
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
                {post.subtitle && (
                  <p className="mt-2 text-sm text-[rgba(255,255,255,0.75)]">{post.subtitle}</p>
                )}
                {post.publishAt && (
                  <p className="mt-2 text-xs uppercase tracking-widest text-[rgba(255,255,255,0.6)]">
                    {formatDate(post.publishAt)}
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

          <div className="grid gap-10 p-6 md:p-10 lg:grid-cols-[1fr_280px]">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-xs text-[rgba(255,255,255,0.65)]">
                <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(0,167,197,0.25)] px-3 py-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(post.publishAt ?? post.date)}
                </span>
                {post.author && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(0,167,197,0.25)] px-3 py-1">
                    <BookOpen className="h-4 w-4" />
                    {post.author}
                  </span>
                )}
                {post.readingTimeMinutes && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(0,167,197,0.25)] px-3 py-1">
                    <Clock className="h-4 w-4" />
                    ~{Math.round(post.readingTimeMinutes)} dk okuma
                  </span>
                )}
                {post.metrics?.views !== undefined && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(0,167,197,0.25)] px-3 py-1">
                    <Eye className="h-4 w-4" />
                    {post.metrics.views.toLocaleString()} görüntülenme
                  </span>
                )}
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-[rgba(255,255,255,0.06)] px-3 py-1 text-xs font-medium text-[rgba(255,255,255,0.7)]">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div
                ref={contentRef}
                className="prose prose-invert max-w-none text-[rgba(255,255,255,0.88)] prose-a:text-[color:var(--color-turkish-blue-300)] prose-strong:text-white prose-h2:text-[color:var(--color-turkish-blue-200)] prose-h3:text-[color:var(--color-turkish-blue-200)]"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderHtml) }}
              />
            </div>

            <aside className="space-y-4 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4">
              <h3 className="text-sm font-semibold text-white">İçindekiler</h3>
              <div className="space-y-2 text-sm text-[rgba(255,255,255,0.7)]">
                {toc.length === 0 && <p className="text-xs text-[rgba(255,255,255,0.5)]">Başlık bulunamadı.</p>}
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={cn(
                      "block rounded-md px-3 py-2 hover:bg-[rgba(255,255,255,0.04)]",
                      item.level > 1 && "pl-5 text-[13px]"
                    )}
                  >
                    {item.title}
                  </a>
                ))}
              </div>

              <div className="h-px bg-[rgba(255,255,255,0.06)]" />

              <h3 className="text-sm font-semibold text-white">Etkileşim</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <LikeButton slug={post.slug || post.id} initialLikes={post.metrics?.likes || 0} />
              </div>

              <h3 className="text-sm font-semibold text-white">Paylaş</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(pageUrl).catch(() => undefined)}
                  className="inline-flex items-center gap-2 rounded-lg border border-[rgba(0,167,197,0.25)] px-3 py-2 text-xs font-medium text-[rgba(130,226,255,0.95)]"
                >
                  <Share2 className="h-4 w-4" />
                  Linki kopyala
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(pageUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-2 text-xs font-medium text-[rgba(255,255,255,0.7)] hover:text-white"
                >
                  Twitter
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-2 text-xs font-medium text-[rgba(255,255,255,0.7)] hover:text-white"
                >
                  LinkedIn
                </a>
              </div>

              {post.seo?.canonicalUrl && (
                <>
                  <div className="h-px bg-[rgba(255,255,255,0.06)]" />
                  <a
                    href={post.seo.canonicalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-[rgba(255,255,255,0.65)] hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Kanonik bağlantı
                  </a>
                </>
              )}
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
