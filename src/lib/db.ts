import "server-only";

import type { Blog, BlogCategory } from "@/types/blog";

const BLOGS_API_URL = "http://host:8080/api/blogs";

const requestBlogApi = async (url: string) => {
  try {
    return await fetch(url, {
      cache: "no-store",
    });
  } catch (error) {
    throw new Error(
      `Blog API isteği tamamlanamadı: ${(error as Error).message}`
    );
  }
};

export const getAllBlogCategories = async (): Promise<BlogCategory[]> => {
  const response = await requestBlogApi(`${BLOGS_API_URL}/categories`);

  if (!response.ok) {
    throw new Error(
      `Blog API isteği ${response.status} durum kodu ile başarısız oldu.`
    );
  }

  const categories = (await response.json()) as BlogCategory[];
  return categories;
}

export const getAllBlogs = async (): Promise<Blog[]> => {
  const response = await requestBlogApi(BLOGS_API_URL);

  if (!response.ok) {
    throw new Error(
      `Blog API isteği ${response.status} durum kodu ile başarısız oldu.`
    );
  }

  const blogs = (await response.json()) as Blog[];

  return [...blogs].sort((a, b) => b.date.localeCompare(a.date));
};

export const getBlogById = async (
  id: string,
): Promise<Blog | null> => {
  const response = await requestBlogApi(`${BLOGS_API_URL}/${id}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Blog API isteği ${response.status} durum kodu ile başarısız oldu.`
    );
  }

  return (await response.json()) as Blog;
};

