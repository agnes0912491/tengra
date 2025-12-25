"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useTranslation } from "@tengra/language";
import { Calendar, Clock, Tag, User, Eye, ArrowRight, Search, SlidersHorizontal, Flame, Settings } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import type { BlogCategory, Blog } from "@/types/blog";
import { safeJsonLd } from "@/lib/jsonld";
import { resolveCdnUrl } from "@/lib/constants";
import { cn } from "@/lib/utils";

const BlogCreateCta = dynamic(() => import("@/components/admin/blogs/blog-create-cta"), { ssr: false });

const placeholderImage = resolveCdnUrl("/uploads/tengra_without_text.png");

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const readingTimeLabel = (minutes?: number) => {
  if (!minutes) return null;
  if (minutes < 1) return "1 dk okuma";
  return `${Math.max(1, Math.round(minutes))} dk okuma`;
};

type BlogCardProps = {
  post: Blog;
  highlight?: boolean;
};

function BlogCard({ post, highlight }: BlogCardProps) {
  const displayDate = post.publishAt ?? post.date;
  const cover = post.heroImage || post.image || placeholderImage;

  return (
    <Link href={`/blogs/${post.id}`} className="group block h-full">
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-2xl border border-[rgba(72,213,255,0.14)] bg-[rgba(10,24,36,0.7)]/90 shadow-[0_24px_65px_rgba(0,0,0,0.45)] transition-all duration-300 backdrop-blur-xl",
          "hover:-translate-y-1 hover:border-[rgba(72,213,255,0.4)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.55),0_0_35px_rgba(30,184,255,0.12)]",
          highlight && "border-[rgba(255,196,109,0.35)] bg-[rgba(20,16,6,0.5)]"
        )}
      >
        <div className="relative h-52 overflow-hidden">
          <Image
            src={cover}
            alt={post.title}
            fill
            crossOrigin="anonymous"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,18,26,0.85)] via-[rgba(8,18,26,0.25)] to-transparent" />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {post.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(255,196,109,0.18)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(255,196,109,0.95)]">
                <Flame className="h-3 w-3" />
                Öne çıkan
              </span>
            )}
            {post.status && (
              <span className="rounded-full bg-[rgba(72,213,255,0.16)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(130,226,255,0.95)]">
                {post.status}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex items-center gap-3 text-xs text-[rgba(255,255,255,0.65)]">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(displayDate)}
            </span>
            {post.author && (
              <span className="inline-flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.author}
              </span>
            )}
            {readingTimeLabel(post.readingTimeMinutes) && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {readingTimeLabel(post.readingTimeMinutes)}
              </span>
            )}
          </div>

          <h3 className="text-xl font-semibold text-white transition-colors group-hover:text-[var(--color-turkish-blue-200)]">
            {post.title}
          </h3>
          {post.subtitle && (
            <p className="mt-1 text-sm text-[rgba(255,255,255,0.65)]">{post.subtitle}</p>
          )}

          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[rgba(255,255,255,0.75)]">
            {post.excerpt || post.summary}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {post.categories.slice(0, 3).map((cat) => (
              <span
                key={cat.slug ?? cat.name}
                className="inline-flex items-center gap-1 rounded-md border border-[rgba(72,213,255,0.25)] bg-[rgba(72,213,255,0.08)] px-2 py-1 text-[11px] font-medium text-[rgba(130,226,255,0.95)]"
              >
                <Tag className="h-3 w-3" />
                {cat.name}
              </span>
            ))}
            {post.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-[rgba(255,255,255,0.06)] px-2 py-1 text-[11px] font-medium text-[rgba(255,255,255,0.7)]"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between text-xs text-[rgba(255,255,255,0.55)]">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.metrics?.views ? `${post.metrics.views.toLocaleString()} görüntülenme` : "Yeni"}
            </span>
            <span className="inline-flex items-center gap-1 text-[rgba(130,226,255,0.9)] group-hover:translate-x-0.5 transition-transform">
              Oku
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

type Props = {
  posts: Blog[];
  categories: BlogCategory[];
};

export default function BlogsClient({ posts, categories }: Props) {
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<"newest" | "popular" | "short">("newest");
  const { t } = useTranslation("Blogs");
  const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tengra.studio";

  const isAdmin = user?.role === "admin";

  const published = useMemo(() => {
    return posts.filter((post) => (post.status ? post.status !== "draft" && post.status !== "archived" : true));
  }, [posts]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    published.forEach((post) => (post.tags ?? []).forEach((tag) => set.add(tag)));
    return Array.from(set);
  }, [published]);

  const featured = useMemo(() => {
    const byFlag = published.find((post) => post.featured);
    return byFlag ?? published[0] ?? null;
  }, [published]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return published
      .filter((post) => {
        if (categoryFilter !== "all") {
          const hit = post.categories.some((cat) => (cat.slug ?? cat.name) === categoryFilter || cat.name === categoryFilter);
          if (!hit) return false;
        }
        if (tagFilter && !(post.tags ?? []).includes(tagFilter)) return false;
        if (!query) return true;
        return (
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          (post.summary ?? "").toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (sort === "popular") {
          const aViews = a.metrics?.views ?? 0;
          const bViews = b.metrics?.views ?? 0;
          return bViews - aViews;
        }
        if (sort === "short") {
          const aRead = a.readingTimeMinutes ?? Number.POSITIVE_INFINITY;
          const bRead = b.readingTimeMinutes ?? Number.POSITIVE_INFINITY;
          return aRead - bRead;
        }
        return (b.publishAt ?? b.date).localeCompare(a.publishAt ?? a.date);
      });
  }, [published, categoryFilter, tagFilter, search, sort]);

  const rest = filtered.filter((post) => post.id !== featured?.id);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: t("seoTitle"),
            description: t("seoDescription"),
            url: `${siteOrigin}/blogs`,
          }),
        }}
      />

      <section className="relative min-h-screen overflow-hidden px-4 py-20 sm:px-6 md:py-24 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 top-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(30,184,255,0.08)_0%,transparent_65%)]" />
          <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(72,213,255,0.08)_0%,transparent_60%)]" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-12">
          <div className="grid gap-10 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
            >
              <h1 className="section-title">{t("title")}</h1>
              <p className="mt-4 text-lg text-[rgba(255,255,255,0.75)]">
                Ürün güncellemeleri, derinlemesine teknik yazılar ve ekipten hikayeler.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[rgba(255,255,255,0.6)]">
                <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(72,213,255,0.2)] bg-[rgba(72,213,255,0.08)] px-3 py-1">
                  <Flame className="h-4 w-4 text-[rgba(255,196,109,0.9)]" />
                  {published.length} makale
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(72,213,255,0.2)] bg-[rgba(72,213,255,0.08)] px-3 py-1">
                  <Tag className="h-4 w-4 text-[rgba(130,226,255,0.95)]" />
                  {categories.length} kategori
                </div>
                {allTags.length > 0 && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(72,213,255,0.2)] bg-[rgba(72,213,255,0.08)] px-3 py-1">
                    <Eye className="h-4 w-4 text-[rgba(130,226,255,0.95)]" />
                    {allTags.length} etiket
                  </div>
                )}
              </div>
            </motion.div>

            {isAuthenticated && isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-[rgba(72,213,255,0.2)] bg-[rgba(8,18,26,0.7)] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-[rgba(72,213,255,0.15)] p-3">
                    <Settings className="h-6 w-6 text-[rgba(130,226,255,0.95)]" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-white">{t("adminPanelTitle")}</h2>
                    <p className="mt-1 text-sm text-[rgba(255,255,255,0.65)]">{t("adminPanelDesc")}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Link
                        href="/admin/dashboard/blogs"
                        prefetch={false}
                        className="inline-flex items-center gap-2 rounded-xl border border-[rgba(72,213,255,0.25)] bg-[rgba(72,213,255,0.1)] px-4 py-2 text-sm font-medium text-[rgba(130,226,255,0.95)] transition hover:border-[rgba(72,213,255,0.35)] hover:bg-[rgba(72,213,255,0.15)]"
                      >
                        {t("goToAdminPanel")}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <BlogCreateCta />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {featured && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-3xl border border-[rgba(255,196,109,0.25)] bg-[linear-gradient(135deg,rgba(255,196,109,0.08),rgba(8,18,26,0.8))] p-1 shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
            >
              <div className="grid gap-8 rounded-[28px] bg-[rgba(8,18,26,0.8)] p-6 md:grid-cols-5 md:p-8">
                <div className="relative min-h-[240px] overflow-hidden rounded-2xl md:col-span-2">
                  <Image
                    src={featured.heroImage || featured.image || placeholderImage}
                    alt={featured.title}
                    fill
                    crossOrigin="anonymous"
                    className="object-cover"
                    sizes="(min-width: 1024px) 40vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,18,26,0.9)] via-[rgba(8,18,26,0.3)] to-transparent" />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="rounded-full bg-[rgba(255,196,109,0.18)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(255,196,109,0.95)]">
                      Öne çıkan
                    </span>
                  </div>
                </div>
                <div className="md:col-span-3 flex flex-col">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[rgba(255,255,255,0.7)]">
                    <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(255,196,109,0.3)] bg-[rgba(255,196,109,0.15)] px-3 py-1 font-semibold uppercase tracking-[0.18em] text-[rgba(255,196,109,0.95)]">
                      {formatDate(featured.publishAt ?? featured.date)}
                    </span>
                    {featured.author && (
                      <span className="inline-flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {featured.author}
                      </span>
                    )}
                    {readingTimeLabel(featured.readingTimeMinutes) && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {readingTimeLabel(featured.readingTimeMinutes)}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">{featured.title}</h2>
                  {featured.subtitle && (
                    <p className="mt-2 text-base text-[rgba(255,255,255,0.65)]">{featured.subtitle}</p>
                  )}
                  <p className="mt-3 text-[rgba(255,255,255,0.78)]">{featured.excerpt || featured.summary}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {featured.categories.slice(0, 3).map((cat) => (
                      <span
                        key={cat.slug ?? cat.name}
                        className="inline-flex items-center gap-1 rounded-md border border-[rgba(72,213,255,0.25)] bg-[rgba(72,213,255,0.08)] px-2 py-1 text-[11px] font-medium text-[rgba(130,226,255,0.95)]"
                      >
                        <Tag className="h-3 w-3" />
                        {cat.name}
                      </span>
                    ))}
                    {featured.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-md bg-[rgba(255,255,255,0.08)] px-2 py-1 text-[11px] font-medium text-[rgba(255,255,255,0.72)]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto pt-6">
                    <Link
                      href={`/blogs/${featured.id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[rgba(255,196,109,0.95)] to-[rgba(255,142,53,0.95)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black shadow-[0_18px_45px_rgba(255,142,53,0.35)] transition hover:shadow-[0_22px_55px_rgba(255,142,53,0.45)]"
                    >
                      Makaleye git
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="rounded-2xl border border-[rgba(72,213,255,0.18)] bg-[rgba(8,18,26,0.65)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(255,255,255,0.45)]" />
                <input
                  id="blog-search"
                  name="search"
                  type="search"
                  autoComplete="off"
                  aria-label="Blog ara"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Başlık, konu veya anahtar kelime ara..."
                  className="w-full rounded-xl border border-[rgba(72,213,255,0.2)] bg-[rgba(12,26,36,0.8)] px-10 py-3 text-sm text-white outline-none transition focus:border-[rgba(72,213,255,0.45)]"
                />
              </div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[rgba(255,255,255,0.6)]" />
                <select
                  id="blog-category-filter"
                  name="category"
                  aria-label="Kategori filtresi"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-lg border border-[rgba(72,213,255,0.2)] bg-[rgba(12,26,36,0.8)] px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="all">Tüm kategoriler</option>
                  {categories.map((cat) => (
                    <option key={cat.slug ?? cat.name} value={cat.slug ?? cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <select
                  id="blog-sort"
                  name="sort"
                  aria-label="Sıralama"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="rounded-lg border border-[rgba(72,213,255,0.2)] bg-[rgba(12,26,36,0.8)] px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="newest">En yeni</option>
                  <option value="popular">En çok okunan</option>
                  <option value="short">Kısa okuma</option>
                </select>
              </div>
            </div>

            {allTags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setTagFilter(null)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition",
                    tagFilter === null
                      ? "bg-[rgba(72,213,255,0.2)] text-[rgba(130,226,255,0.95)]"
                      : "bg-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.65)] hover:bg-[rgba(255,255,255,0.08)]"
                  )}
                >
                  Tümü
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTagFilter(tag)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition",
                      tagFilter === tag
                        ? "bg-[rgba(72,213,255,0.2)] text-[rgba(130,226,255,0.95)]"
                        : "bg-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.65)] hover:bg-[rgba(255,255,255,0.08)]"
                    )}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featured && filtered.length > 0 && (
              <div className="md:col-span-2 lg:col-span-3">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[rgba(255,255,255,0.55)]">
                  Son eklenenler
                </h3>
              </div>
            )}
            {rest.map((post) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <BlogCard post={post} />
              </motion.div>
            ))}
          </div>

          {rest.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <p className="text-[rgba(255,255,255,0.65)]">Filtrelere uyan yazı bulunamadı.</p>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
