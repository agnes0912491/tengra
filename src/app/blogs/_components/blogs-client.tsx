"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { Blog } from "@/types/blog";

interface BlogsClientProps {
  posts: Blog[];
}

export function BlogsClient({ posts }: BlogsClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = useMemo(() => {
    const unique = new Set<string>();
    for (const post of posts) {
      for (const category of post.categories) {
        unique.add(category);
      }
    }

    return ["All", ...unique];
  }, [posts]);

  const filtered = useMemo(() => {
    if (activeCategory === "All") {
      return posts;
    }

    return posts.filter((post) => post.categories.includes(activeCategory));
  }, [activeCategory, posts]);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-1 rounded-full text-sm border transition ${
              activeCategory === category
                ? "bg-[rgba(0,167,197,0.2)] text-[color:var(--color-turkish-blue-300)] border-[rgba(0,167,197,0.4)]"
                : "border-gray-700 text-gray-400 hover:border-[rgba(0,167,197,0.3)] hover:text-[color:var(--color-turkish-blue-300)]"
            }`}
          >
            {category}
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
              width={480}
              height={320}
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
    </>
  );
}

