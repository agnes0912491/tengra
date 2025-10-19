import type { Blog, BlogCategory } from "@/types/blog";
import { User } from "./auth/users";
import { AuthUserPayload } from "@/types/auth";

// Base API URL for the backend. Fallback to localhost in development to avoid
// generating an invalid URL when the env var is absent.
const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000";
// All public content endpoints are served under /api on the backend Router.
const BLOGS_API_URL = `${API_BASE}/blogs`;

type BlogCategoriesResponse = {
  categories?: BlogCategory[];
};

type BlogsResponse = {
  blogs?: Blog[];
};

/**
 * Fetches all blog categories from the backend.
 * Throws an Error when the backend returns a non-2xx response.
 */
export const getAllBlogCategories = async (): Promise<BlogCategory[]> => {
  const response = await fetch(`${BLOGS_API_URL}/categories`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Failed to fetch blog categories: HTTP ${response.status}${
        text ? ` - ${text}` : ""
      }`
    );
  }

  const json = (await response
    .json()
    .catch(() => ({} as BlogCategoriesResponse))) as BlogCategoriesResponse;

  return Array.isArray(json.categories) ? json.categories : [];
};

/**
 * Fetches all public blogs.
 */
export const getAllBlogs = async (): Promise<Blog[]> => {
  const response = await fetch(BLOGS_API_URL, { cache: "no-store" });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Failed to fetch blogs: HTTP ${response.status}${
        text ? ` - ${text}` : ""
      }`
    );
  }

  const json = (await response
    .json()
    .catch(() => ({} as BlogsResponse))) as BlogsResponse;
  const list = Array.isArray(json.blogs) ? json.blogs : [];

  return [...list].sort((a, b) => b.date.localeCompare(a.date));
};

/**
 * Fetch a single blog by id. Returns null if not found (404).
 */
export const getBlogById = async (id: string): Promise<Blog | null> => {
  const response = await fetch(`${BLOGS_API_URL}/${id}`, { cache: "no-store" });

  if (response.status === 404) return null;
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Failed to fetch blog ${id}: HTTP ${response.status}${
        text ? ` - ${text}` : ""
      }`
    );
  }

  return (await response.json()) as Blog;
};

export const getAllUsers = async (token: string): Promise<User[]> => {
  if (!token) {
    throw new Error("Token sağlanmadı.");
  }

  const response = await fetch(`${API_BASE}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Kullanıcıları alırken hata oluştu: ${response.status} durum kodu.`
    );
  }

  return (await response.json()) as User[];
};

export const authenticateUserWithPassword = async (
  email: string,
  password: string
): Promise<AuthUserPayload | null> => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ username: email, password }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response
    .json()
    .catch(() => ({} as AuthUserPayload))) as AuthUserPayload;
  if (!payload || !payload.token) {
    return null;
  }

  return payload;
};

export const getUserWithId = async (id: string): Promise<User | null> => {
  if (!id) {
    throw new Error("Kullanıcı ID'si sağlanmadı.");
  }

  const response = await fetch(`${API_BASE}/users/${id}`, {
    headers: {
      Accept: "application/json",
    },
    method: "GET",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as User;
};

export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<User | null> => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json().catch(() => null)) as User | null;
};

export const getUserWithToken = async (token: string): Promise<User | null> => {
  if (!token) {
    throw new Error("Token sağlanmadı.");
  }

  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    method: "GET",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as User;
};
