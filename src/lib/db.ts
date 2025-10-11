import "server-only";

import type { Blog } from "@/types/blog";

const BLOGS_API_URL = "http://host:8080/api/blogs";

const ensureToken = (token: string | null | undefined) => {
  if (!token) {
    throw new Error("Geçerli bir yönetici oturum belirteci bulunamadı.");
  }

  return token;
};

const requestBlogApi = async (url: string, token: string) => {
  try {
    return await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch (error) {
    throw new Error(
      `Blog API isteği tamamlanamadı: ${(error as Error).message}`
    );
  }
};

export const getAllBlogs = async (tokenValue?: string | null): Promise<Blog[]> => {
  const token = ensureToken(tokenValue);
  const response = await requestBlogApi(BLOGS_API_URL, token);

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
  tokenValue?: string | null
): Promise<Blog | null> => {
  const token = ensureToken(tokenValue);
  const response = await requestBlogApi(`${BLOGS_API_URL}/${id}`, token);

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

