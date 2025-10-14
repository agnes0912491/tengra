"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/providers/auth-provider";
import { BlogCategory, Blog } from "@/types/blog";
import Cookies from "js-cookie";
import { generateSEO } from "@/lib/seo";

interface Props {
  posts: Blog[];
  categories: BlogCategory[];
  token?: string | null;
}

export async function generateMetadata(posts: Blog[]) {
  const topTitles = posts
    .slice(0, 3)
    .map((b) => b.title)
    .join(", ");
  const description = `Read the latest insights from Tengra Studio — ${topTitles}, and more.`;

  return generateSEO({
    title: "Blogs",
    description,
    type: "website",
    url: "https://tengra.studio/blogs",
    image: "https://tengra.studio/og-image.png",
    createdAt: posts[0]?.createdAt,
  });
}

export default function BlogsClient({
  posts,
  categories,
  token: tokenProp,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | null>(
    null
  );
  const { user, isAuthenticated } = useAuth();
  console.log({ user, isAuthenticated });
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    if (user && user?.id) {
      setIsAdmin(user?.role === "admin");
    }
  }, [user]);

  //const token = tokenProp ?? Cookies.get("admin_session");

  const filtered = useMemo(() => {
    if (!activeCategory) return posts;
    return posts.filter((post) =>
      post.categories.find(
        (cat: BlogCategory) => cat.name === activeCategory.name
      )
    );
  }, [activeCategory, posts]);

  const metadata = useMemo(() => generateMetadata(filtered), [filtered]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(metadata),
        }}
      />

      <section className="min-h-screen py-24 px-6 md:px-20">
        <h1 className="text-4xl text-center mb-12 text-[color:var(--color-turkish-blue-400)] font-display tracking-[0.25em]">
          BLOGS
        </h1>

        {isAuthenticated && isAdmin && (
          <div className="mx-auto mb-12 max-w-4xl rounded-xl border border-[rgba(0,167,197,0.25)] bg-[rgba(0,167,197,0.06)] p-6 text-left">
            <h2 className="text-lg font-semibold text-[color:var(--color-turkish-blue-200)]">
              Blog Yönetimi
            </h2>
            <p className="mt-2 text-xs text-gray-300">
              Yalnızca admin rolüne sahip kullanıcılar bu araçları görebilir.
              Yeni yazılar eklemek veya mevcut taslakları düzenlemek için admin
              panelini kullanabilirsiniz.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <Link
                href="/admin"
                prefetch={false}
                className="rounded-full border border-[rgba(0,167,197,0.4)] px-4 py-1 text-[color:var(--color-turkish-blue-200)] transition hover:bg-[rgba(0,167,197,0.12)]"
              >
                Admin Paneline Dön
              </Link>
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

        {isAuthenticated && isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
            <p className="mt-2 text-xs text-gray-300">
              Yalnızca admin rolüne sahip kullanıcılar bu araçları görebilir.
              Yeni yazılar eklemek veya mevcut taslakları düzenlemek için admin
              panelini kullanabilirsiniz.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <Link
                href="/admin"
                prefetch={false}
                className="rounded-full border border-[rgba(0,167,197,0.4)] px-4 py-1 text-[color:var(--color-turkish-blue-200)] transition hover:bg-[rgba(0,167,197,0.12)]"
              >
                Admin Paneline Dön
              </Link>
              <button
                type="button"
                className="rounded-full border border-dashed border-[rgba(0,167,197,0.4)] px-4 py-1 text-[color:var(--color-turkish-blue-200)] opacity-80"
              >
                Yeni Yazı Oluştur
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
                  <span>by {post.author}</span>
                </div>
                <h3 className="text-lg text-[color:var(--color-turkish-blue-300)] font-semibold mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{post.excerpt}</p>
                <div className="flex flex-wrap gap-2">
                  {post.categories.map((cat: BlogCategory) => (
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
