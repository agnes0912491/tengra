"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslation } from "@tengra/language";
import { useRouter } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkGfm from "remark-gfm";
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

type BlogPostProps = {
  postId: string;
};

export default function BlogPost({ postId }: BlogPostProps) {
  const router = useRouter();
  const { t } = useTranslation("Blogs");
  const { t: tCommon } = useTranslation("common");
  const { language: locale } = useTranslation();
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
        // Check if it's actual HTML (not markdown with images like ![...])
        const looksLikeHtml = post.format === "html" || (/<[a-z][^>]*>/i.test(raw) && !raw.startsWith('#'));
        if (post.contentHtml) {
          setRenderHtml(post.contentHtml);
        } else if (looksLikeHtml) {
          setRenderHtml(raw);
        } else {
          const file = await remark()
            .use(remarkGfm)
            .use(remarkHtml, { sanitize: false })
            .process(raw);
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
  const leadText = post?.excerpt || post?.summary;
  const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };
  const statusLabelMap: Record<string, string> = {
    draft: t("status.draft"),
    published: t("status.published"),
    scheduled: t("status.scheduled"),
    archived: t("status.archived"),
  };
  const statusLabel = post?.status ? statusLabelMap[post.status] ?? post.status : null;

  if (notFound) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-center text-[rgba(255,255,255,0.7)]">
        <p className="text-lg">{t("notFound")}</p>
        <button
          onClick={() => router.push("/blogs")}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[rgba(72,213,255,0.2)] px-4 py-2 text-sm font-semibold text-[rgba(130,226,255,0.95)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {tCommon("backToBlogs")}
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

      <div className="relative mx-auto max-w-[1400px] px-6 py-12 md:px-8 md:py-20">
        {/* Ambient Background - Subtle */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-[20%] right-[10%] h-[800px] w-[800px] rounded-full bg-blue-500/5 blur-[120px]" />
          <div className="absolute top-[20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-purple-500/5 blur-[120px]" />
        </div>

        {/* Top Navigation Bar */}
        <div className="mb-12 flex items-center justify-between">
          <button
            onClick={() => router.push("/blogs")}
            className="group inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-white/10 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {tCommon("backToBlogs")}
          </button>
          {statusLabel && (
            <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 ring-1 ring-inset ring-cyan-500/20">
              {statusLabel}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_300px] lg:gap-20 xl:gap-24">
          {/* Main Content Article */}
          <main className="min-w-0">
            {/* Header Section */}
            <header className="mb-10 md:mb-14">
              <div className="mb-6 flex flex-wrap gap-2">
                {post.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <h1 className="mb-6 font-display text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                {post.title}
              </h1>

              {post.subtitle && (
                <p className="mb-8 text-xl font-light leading-relaxed text-slate-300 md:text-2xl">
                  {post.subtitle}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 border-b border-white/5 pb-8">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 uppercase text-xs font-bold text-white">
                    {post.author ? post.author.charAt(0) : t("authorInitial")}
                  </div>
                  <span className="font-medium text-slate-200">
                    {post.author || t("anonymous")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <time dateTime={post.publishAt ?? post.date}>
                    {formatDate(post.publishAt ?? post.date)}
                  </time>
                </div>
                {post.readingTimeMinutes && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span>~{t("minutesRead", { minutes: Math.round(post.readingTimeMinutes) })}</span>
                  </div>
                )}
                {post.metrics?.views !== undefined && (
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-slate-500" />
                    <span>{t("views", { count: post.metrics.views.toLocaleString(locale) })}</span>
                  </div>
                )}
              </div>
            </header>

            {/* Featured Image */}
            {post.image && (
              <div className="mb-12 overflow-hidden rounded-2xl border border-white/5 bg-slate-900 shadow-2xl">
                <div className="relative aspect-video w-full">
                  <Image
                    crossOrigin="anonymous"
                    src={resolveCdnUrl(post.image)}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  />
                </div>
              </div>
            )}

            {/* Content Body */}
            <div className="relative">
              {leadText && (
                <div className="mb-10 rounded-2xl border-l-4 border-cyan-500 bg-gradient-to-r from-cyan-950/30 to-transparent p-6 text-lg italic leading-relaxed text-slate-200 md:p-8">
                  {leadText}
                </div>
              )}

              <div
                ref={contentRef}
                className="prose prose-invert prose-lg max-w-none whitespace-pre-line
                  prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-100 
                  prose-headings:mt-12 prose-headings:mb-6
                  prose-p:leading-loose prose-p:text-slate-300 prose-p:mb-8 text-lg [&_p]:mb-8 [&_p]:leading-loose
                  prose-a:text-cyan-400 prose-a:transition-colors prose-a:no-underline hover:prose-a:text-cyan-300 
                  prose-strong:font-semibold prose-strong:text-white
                  prose-li:text-slate-300 prose-ul:space-y-3 prose-ol:space-y-3 prose-li:marker:text-slate-500
                  prose-code:rounded-md prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono prose-code:text-cyan-200 before:prose-code:content-none after:prose-code:content-none
                  prose-pre:bg-slate-950/50 prose-pre:border prose-pre:border-white/5 prose-pre:rounded-xl prose-pre:p-6
                  prose-img:rounded-xl prose-img:border prose-img:border-white/5 prose-img:shadow-2xl prose-img:my-10 prose-img:w-full"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderHtml) }}
              />
            </div>
          </main>

          {/* Sidebar Area */}
          <aside className="hidden lg:block">
            <div className="sticky top-8 space-y-8">
              {/* Table of Contents */}
              {toc.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                    {t('tableOfContents')}
                  </h3>
                  <nav className="relative flex flex-col gap-1.5 text-base text-slate-300">
                    {/* Modern decorative line */}
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-white/5" />

                    {toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={cn(
                          "block border-l-2 border-transparent px-4 py-2 transition-colors hover:border-cyan-500 hover:text-cyan-300 font-medium",
                          item.level > 1 && "pl-8 text-sm"
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        {item.title}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Actions Card */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm">
                <div className="mb-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {t("engagement")}
                  </h3>
                  <LikeButton slug={post.slug || post.id} initialLikes={post.metrics?.likes || 0} />
                </div>

                <div className="space-y-4 pt-6 border-t border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {t("share")}
                  </h3>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(pageUrl).catch(() => undefined);
                        // Optional: Add toast hint
                      }}
                      className="group flex w-full items-center justify-between rounded-lg bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <span>{t("copyLink")}</span>
                      <Share2 className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                    </button>
                    {/* Add more share buttons here if needed */}
                  </div>
                </div>

                {post.seo?.canonicalUrl && (
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <a
                      href={post.seo.canonicalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-xs text-slate-500 hover:text-cyan-400 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {t("canonicalLink")}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
