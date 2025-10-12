import type { Blog, BlogCategory } from "@/types/blog";
import { User } from "./auth/users";
import { AuthUserPayload } from "@/types/auth"; 

const BLOGS_API_URL = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/blogs`;
 

export const getAllBlogCategories = async (): Promise<BlogCategory[]> => { 
  const response = await fetch(`${BLOGS_API_URL}/categories`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Blog API isteği ${response.status} durum kodu ile başarısız oldu.`
    );
  }

  const categories = (await response.json()).categories as BlogCategory[];
  return categories;
}

export const getAllBlogs = async (): Promise<Blog[]> => {
  console.log("getAllBlogs fonksiyonu çağrıldı. " + BLOGS_API_URL);
  const response = await fetch(BLOGS_API_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Blog API isteği ${response.status} durum kodu ile başarısız oldu.`
    );
  }

  const blogs = (await response.json()).blogs as Blog[];

  return [...blogs].sort((a, b) => b.date.localeCompare(a.date));
};

export const getBlogById = async (
  id: string,
): Promise<Blog | null> => {
  const response = await fetch(`${BLOGS_API_URL}/${id}`, {
    cache: "no-store",
  });

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

export const getAllUsers = async (token: string): Promise<User[]> => {
  if(!token) {
    throw new Error("Token sağlanmadı.");
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json" 
    },
  });

  if (!response.ok) {
    throw new Error(
      `Kullanıcıları alırken hata oluştu: ${response.status} durum kodu.`
    );
  }

  const users = (await response.json()) as User[];
  return users;   
    }

export const authenticateUserWithPassword = async (
  email: string,
  password: string
): Promise<AuthUserPayload | null> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username: email, password }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json().catch(() => ({}))) as AuthUserPayload;
  if (!payload || !payload.token) {
    return null;
  }

  return payload;
}

export const getUserWithId = async (id: string): Promise<User | null> => {
  if(!id) {
    throw new Error("Kullanıcı ID'si sağlanmadı.");
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/${id}`, {
    headers: {
      Accept: "application/json"
    },
    method: "GET"
  });

  if (!response.ok) {
    return null;
  }

  const user = (await response.json()) as User;
  return user;   
}

export const registerUser = async (name: string, email: string, password: string): Promise<User | null> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    return null;
  }

  const user = (await response.json().catch(() => null)) as User | null;
  return user;
}

export const getUserWithToken = async (token: string): Promise<User | null> => {
  if(!token) {
    throw new Error("Token sağlanmadı.");
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json" 
    },
    method: "GET"
  });

  if (!response.ok) {
    return null;
  }

  const user = (await response.json()) as User;
  return user;   
}