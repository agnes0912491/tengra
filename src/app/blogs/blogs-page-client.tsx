"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "@tengra/language";

import BlogsClient from "./BlogsClient";
import { getAllBlogs, getAllBlogCategories } from "@/lib/db";
import type { Blog, BlogCategory } from "@/types/blog";

export default function BlogsPageClient() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [posts, setPosts] = useState<Blog[]>([]);
  const { t } = useTranslation("Blogs");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [fetchedCategories, fetchedPosts] = await Promise.all([
          getAllBlogCategories(),
          getAllBlogs(),
        ]);

        if (!isMounted) {
          return;
        }

        setCategories(fetchedCategories);
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Failed to load blogs:", error);
        if (isMounted) {
          setCategories([]);
          setPosts([]);
          toast.error(t("toast.fetchError"));
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [t]);

  return <BlogsClient posts={posts} categories={categories} />;
}
