"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/providers/auth-provider";
import { BlogCategory, Blog } from "@/types/blog";
import { useTranslations } from "next-intl";
import { safeJsonLd } from "@/lib/jsonld";

interface Props {
  posts: Blog[];
  categories: BlogCategory[];
}

export default function BlogsClient({ posts, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | null>(
    null
  );
  const { user, isAuthenticated } = useAuth();
  const t = useTranslations("Blogs");
  const siteOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://tengra.studio";

  const isAdmin = user?.role === "admin";

  const filtered = useMemo(() => {
    if (!activeCategory) return posts;
    return posts.filter((post) =>
      post.categories.some((cat) => cat.name === activeCategory.name)
    );
  }, [activeCategory, posts]);

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

      <section className="min-h-screen py-24 px-6 md:px-20">
        <h1 className="text-4xl text-center mb-12 text-[color:var(--color-turkish-blue-400)] font-display tracking-[0.25em]">
          {t("title")}
        </h1>

        {isAuthenticated && isAdmin && (
          <div className="mx-auto mb-12 max-w-4xl rounded-xl border border-[rgba(0,167,197,0.25)] bg-[rgba(0,167,197,0.06)] p-6 text-left">
            <h2 className="text-lg font-semibold text-[color:var(--color-turkish-blue-200)]">
              {t("adminPanelTitle")}
            </h2>
            <p className="mt-2 text-xs text-gray-300">{t("adminPanelDesc")}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <Link
                href="/admin/dashboard"
                prefetch={false}
                className="rounded-full border border-[rgba(0,167,197,0.4)] px-4 py-1 text-[color:var(--color-turkish-blue-200)] transition hover:bg-[rgba(0,167,197,0.12)]"
              >
                {t("goToAdminPanel")}
              </Link>
              <button
                type="button"
                className="rounded-full border border-dashed border-[rgba(0,167,197,0.4)] px-4 py-1 text-[color:var(--color-turkish-blue-200)] opacity-80"
              >
                {t("createNewPost")}
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1 rounded-full text-sm border transition ${
                activeCategory?.name === cat.name
                  ? "bg-[rgba(0,167,197,0.2)] text-[color:var(--color-turkish-blue-300)] border-[rgba(0,167,197,0.4)]"
                  : "border-gray-700 text-gray-400 hover:border-[rgba(0,167,197,0.3)] hover:text-[color:var(--color-turkish-blue-300)]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {filtered.map((post) => (
            <Link
              key={post.id}
              href={`/blogs/${post.id}`}
              className="group bg-[rgba(255,255,255,0.03)] backdrop-blur-xl rounded-xl overflow-hidden border border-[rgba(0,167,197,0.15)] hover:border-[rgba(0,167,197,0.4)] transition"
            >
              <Image
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition"
                width={800}
                height={480}
              />
              <div className="p-5">
                <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                  <span>{post.date}</span>
                  <span>
                    {t("by")} {post.author}
                  </span>
                </div>
                <h3 className="text-lg text-[color:var(--color-turkish-blue-300)] font-semibold mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{post.excerpt}</p>
                <div className="flex flex-wrap gap-2">
                  {post.categories.map((cat) => (
                    <span
                      key={cat.name}
                      className="text-xs px-2 py-0.5 rounded-full bg-[rgba(0,167,197,0.15)] border border-[rgba(0,167,197,0.3)] text-[color:var(--color-turkish-blue-200)]"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
