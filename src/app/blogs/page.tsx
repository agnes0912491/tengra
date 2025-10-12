"use client";

import { getAllBlogs, getAllBlogCategories } from "@/lib/db";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import BlogsClient from "./BlogsClient";
import Cookies from "js-cookie";
import { Blog, BlogCategory } from "@/types/blog";
import { useState } from "react";
import { useEffect } from "react";

export default function BlogsPage() {
  const token = Cookies.get(ADMIN_SESSION_COOKIE);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [posts, setPosts] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const categories = await getAllBlogCategories();
      const posts = await getAllBlogs();
      setCategories(categories);
      setPosts(posts);
    };

    fetchData();
  }, []);

  return <BlogsClient posts={posts} categories={categories} token={token} />;
}
