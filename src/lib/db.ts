import type { Blog, BlogCategory } from "@/types/blog";
import type { Project, ProjectStatus } from "@/types/project";
import { Role, User } from "./auth/users";
import { AuthUserPayload } from "@/types/auth";

// Base API URL for the backend. Fallback to localhost in development to avoid
// generating an invalid URL when the env var is absent.
const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000";
// All public content endpoints are served under /api on the backend Router.
const BLOGS_API_URL = `${API_BASE}/blogs`;
const PROJECTS_API_URL = `${API_BASE}/projects`;

type ServerHealthResponse = {
  status?: string;
  uptime?: number | string;
  version?: string;
  lastDeploymentAt?: string;
};

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
  username: string,
  email: string,
  password: string
): Promise<User | null> => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json().catch(() => null)) as User | null;
};

type RawUser = Partial<User> & {
  id?: string | number;
  userId?: string | number;
  name?: string | null;
  displayName?: string | null;
  username?: string | null;
  email?: string | null;
  role?: string | null;
  avatar?: string | null;
};

type AuthMePayload = {
  user?: RawUser | null;
};

const normalizeUser = (raw: RawUser | null | undefined): User | null => {
  if (!raw) {
    return null;
  }

  const id = raw.id ?? raw.userId;
  const email = raw.email ?? raw.username ?? "";
  if (id === undefined || id === null || !email) {
    return null;
  }
 
  const role = (raw.role ?? "user").toString().toLowerCase();

  return {
    id: String(id), 
    email,
    role: role === "admin" ? "admin" : "user",
    username: raw.username ?? undefined,
    displayName: raw.displayName ?? raw.name ?? undefined,
    avatar: raw.avatar ?? undefined,
  };
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

  const payload = (await response.json().catch(() => null)) as
    | AuthMePayload
    | RawUser
    | null;

  if (!payload) {
    return null;
  }

  const rawUser = ("user" in payload ? payload.user : payload) as RawUser | null;
  return normalizeUser(rawUser);
};

const normalizeProject = (project: unknown): Project | null => {
  if (!project || typeof project !== "object") {
    return null;
  }

  const candidate = project as Record<string, unknown>;
  const id = candidate.id ?? candidate.projectId ?? candidate.slug;
  const name = candidate.name ?? candidate.title;

  if (!id || !name) {
    return null;
  }

  let status: ProjectStatus | undefined;
  if (typeof candidate.status === "string") {
    const normalized = candidate.status.toLowerCase();
    const allowed: ProjectStatus[] = [
      "draft",
      "in_progress",
      "on_hold",
      "completed",
      "archived",
    ];

    if ((allowed as string[]).includes(normalized)) {
      status = normalized as ProjectStatus;
    }
  }

  return {
    id: String(id),
    name: String(name),
    slug: candidate.slug ? String(candidate.slug) : undefined,
    description:
      typeof candidate.description === "string"
        ? candidate.description
        : candidate.summary && typeof candidate.summary === "string"
        ? candidate.summary
        : undefined,
    status,
    lastUpdatedAt:
      typeof candidate.updatedAt === "string"
        ? candidate.updatedAt
        : typeof candidate.lastUpdatedAt === "string"
        ? candidate.lastUpdatedAt
        : undefined,
    createdAt:
      typeof candidate.createdAt === "string"
        ? candidate.createdAt
        : undefined,
  };
};

export const getAllProjects = async (
  token?: string
): Promise<Project[]> => {
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(PROJECTS_API_URL, {
      cache: "no-store",
      headers,
    });

    if (!response.ok) {
      return [];
    }

    const json = await response.json().catch(() => []);
    if (!Array.isArray(json)) {
      return [];
    }

    return json
      .map((item) => normalizeProject(item))
      .filter((item): item is Project => Boolean(item));
  } catch (error) {
    console.error("Failed to fetch projects", error);
    return [];
  }
};

export type ServerHealth = {
  status: "online" | "offline";
  uptimeSeconds?: number;
  version?: string;
  lastDeploymentAt?: string;
};

const parseUptime = (uptime: number | string | undefined): number | undefined => {
  if (typeof uptime === "number") {
    return uptime;
  }

  if (typeof uptime === "string") {
    const normalized = Number.parseFloat(uptime);
    return Number.isFinite(normalized) ? normalized : undefined;
  }

  return undefined;
};

export const getServerHealth = async (
  token?: string
): Promise<ServerHealth> => {
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/health`, {
      cache: "no-store",
      headers,
    });

    if (!response.ok) {
      return { status: "offline" };
    }

    const json = (await response
      .json()
      .catch(() => ({} as ServerHealthResponse))) as ServerHealthResponse;

    const uptimeSeconds = parseUptime(json.uptime);
    const normalizedStatus = json.status?.toString().toLowerCase();

    return {
      status:
        normalizedStatus === "ok" || normalizedStatus === "online"
          ? "online"
          : "offline",
      uptimeSeconds,
      version: json.version ?? undefined,
      lastDeploymentAt: json.lastDeploymentAt ?? undefined,
    };
  } catch (error) {
    console.error("Failed to read server health", error);
    return { status: "offline" };
  }
};

export const updateUserRole = async (
  userId: string,
  role: Role,
  token: string
): Promise<User> => {
  if (!userId) {
    throw new Error("Kullanıcı ID'si sağlanmadı.");
  }

  if (!token) {
    throw new Error("Yetkilendirme anahtarı eksik.");
  }

  const response = await fetch(`${API_BASE}/users/${userId}/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Kullanıcı rolü güncellenemedi: HTTP ${response.status}${
        text ? ` - ${text}` : ""
      }`
    );
  }

  const json = (await response.json().catch(() => null)) as RawUser | null;
  const user = normalizeUser(json);

  if (!user) {
    throw new Error("Kullanıcı bilgisi alınamadı.");
  }

  return user;
};
