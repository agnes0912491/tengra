"use client";
import BlogsClient from "./BlogsClient";
import { getAllBlogs, getAllBlogCategories } from "@/lib/db";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import { useState, useEffect } from "react";
import { Blog, BlogCategory } from "@/types/blog";
import Cookies from "js-cookie";

export default function BlogsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [posts, setPosts] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get(ADMIN_SESSION_COOKIE) || null;
      const categories = await getAllBlogCategories();
      const posts = await getAllBlogs();
      if (token) {
        setToken(token);
      }
      setCategories(categories);
      setPosts(posts);
    };

    fetchData();
  }, []);

  return <BlogsClient posts={posts} categories={categories} token={token} />;
}
