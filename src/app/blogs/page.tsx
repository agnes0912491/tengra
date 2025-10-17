"use client";
import BlogsClient from "./BlogsClient";
import { getAllBlogs, getAllBlogCategories } from "@/lib/db"; 
import { useState, useEffect } from "react";
import { Blog, BlogCategory } from "@/types/blog"; 

export default function BlogsPage() { 
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

  return <BlogsClient posts={posts} categories={categories} />;
}
