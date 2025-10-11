"use client";

import Link from "next/link";
import { useState } from "react";
import { mockBlogs } from "@/lib/mockBlogs";
import Image from "next/image";

export default function BlogsPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    "All",
    ...Array.from(new Set(mockBlogs.flatMap((b) => b.categories))),
  ];

  const filtered =
    activeCategory === "All"
      ? mockBlogs
      : mockBlogs.filter((b) => b.categories.includes(activeCategory));

  return (
    <section className="min-h-screen py-24 px-6 md:px-20">
      <h1 className="text-4xl text-center mb-12 text-[color:var(--color-turkish-blue-400)] font-display tracking-[0.25em]">
        BLOGS
      </h1>

      {/* Filtre butonları */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1 rounded-full text-sm border transition ${
              activeCategory === cat
                ? "bg-[rgba(0,167,197,0.2)] text-[color:var(--color-turkish-blue-300)] border-[rgba(0,167,197,0.4)]"
                : "border-gray-700 text-gray-400 hover:border-[rgba(0,167,197,0.3)] hover:text-[color:var(--color-turkish-blue-300)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Blog kartları */}
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
                {post.categories.map((cat) => (
                  <span
                    key={cat}
                    className="text-xs px-2 py-0.5 rounded-full bg-[rgba(0,167,197,0.15)] border border-[rgba(0,167,197,0.3)] text-[color:var(--color-turkish-blue-200)]"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
