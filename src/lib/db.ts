import type { Blog, BlogCategory } from "@/types/blog";
import type { Project, ProjectStatus, ProjectType } from "@/types/project";
import { Role, User } from "./auth/users";
import { AuthUserPayload } from "@/types/auth";

// Base API URL for the backend. Fallback to localhost in development to avoid
// generating an invalid URL when the env var is absent.
const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000";
// All public content endpoints are served under /api on the backend Router.
const BLOGS_API_URL = `${API_BASE}/blogs`;
const PROJECTS_API_URL = `${API_BASE}/projects`;
const ANALYTICS_API_URL = `${API_BASE}/analytics`;
const UPLOAD_API_URL = `${API_BASE}/upload`;

type BlogCategoriesResponse = {
  categories?: BlogCategory[];
};

// Backend blog API response shapes
type RawBlogPost = {
  id?: number | string;
  author_id?: number | string;
  title?: string;
  content?: string;
  createdAt?: string;
  image?: string;
};

type BlogsListResponse = {
  posts?: RawBlogPost[];
};

type BlogSingleResponse = {
  post?: RawBlogPost;
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

export const createBlogCategory = async (name: string): Promise<BlogCategory | null> => {
  const response = await fetch(`${BLOGS_API_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) return null;
  const json = (await response.json().catch(() => null)) as { category?: BlogCategory } | null;
  return json?.category ?? null;
};

/**
 * Fetches all public blogs.
 */
const normalizeBlog = (raw: RawBlogPost | null | undefined): Blog | null => {
  if (!raw) return null;

  const id = raw.id ?? undefined;
  const title = raw.title ?? undefined;
  const content = raw.content ?? "";
  const createdAt = raw.createdAt ?? "";
  const authorId = raw.author_id ?? undefined;

  if (id === undefined || title === undefined) return null;

  // Derive minimal fields required by Blog type; fill gaps with sensible defaults
  const date = createdAt || new Date().toISOString();
  const excerpt = content ? content.slice(0, 160) : "";

  return {
    id: String(id),
    title,
    date,
    author: authorId !== undefined ? String(authorId) : "",
    excerpt,
    content,
    image: raw.image ?? "",
    categories: [],
    createdAt: date,
    updatedAt: date,
  };
};

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
    .catch(() => ({} as BlogsListResponse))) as BlogsListResponse;
  const list = Array.isArray(json.posts) ? json.posts : [];

  return list
    .map((post) => normalizeBlog(post))
    .filter((p): p is Blog => Boolean(p))
    .sort((a, b) => b.date.localeCompare(a.date));
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

  const json = (await response
    .json()
    .catch(() => ({} as BlogSingleResponse))) as BlogSingleResponse;
  const normalized = normalizeBlog(json.post);
  return normalized ?? null;
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

  // The backend returns an object { users: [...] } while some callers
  // historically expected a raw array. Accept both shapes for robustness.
  const json = await response.json().catch(() => null);
  if (!json) return [];

  if (Array.isArray(json)) {
    return json as User[];
  }

  const asObj = json as { users?: unknown };
  if (Array.isArray(asObj.users)) {
    return asObj.users as User[];
  }

  // Unexpected shape
  throw new Error("Kullanıcı verisi beklenmeyen formatta döndü.");
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

  // Return the raw payload even when the server indicates 2FA is required
  const payload = (await response
    .json()
    .catch(() => ({} as AuthUserPayload))) as AuthUserPayload;

  return payload;
};

export const verifyTempToken = async (
  tempToken: string,
  twoFactorCode: string
): Promise<AuthUserPayload | null> => {
    // Always parse the JSON payload so the UI can display specific error messages
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ tempToken, twoFactorCode }),
    });

    try {
      const payload: AuthUserPayload = await response.json();
      return payload;
    } catch {
      // If the response isn't JSON for some reason, return a generic failure
      return { success: false, error: "unexpected_response" } as AuthUserPayload;
    }
};

export const resendTempToken = async (tempToken: string): Promise<AuthUserPayload | null> => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ tempToken, resend: "true" }),
  });

  try {
    const payload: AuthUserPayload = await response.json();
    return payload;
  } catch {
    return { success: false, error: "unexpected_response" } as AuthUserPayload;
  }
};

/**
 * Verify an admin OTP challenge. This wraps the same backend login endpoint
 * used for completing 2FA: the server accepts an otpToken/temporary token
 * and the OTP code and responds with the final AuthUserPayload on success.
 */
export const verifyAdminOtp = async (
  email: string,
  otpCode: string,
  otpToken?: string,
  temporaryToken?: string
): Promise<AuthUserPayload | null> => {
  // Build a flexible payload to match the backend's expected fields. Some
  // deployments return otpToken, others use tempToken; include both where
  // available so the request is accepted.
  const body: Record<string, unknown> = { twoFactorCode: otpCode };
  if (otpToken) body.otpToken = otpToken;
  if (temporaryToken) body.tempToken = temporaryToken;
  if (email) body.username = email;

  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  try {
    const payload: AuthUserPayload = await response.json();
    return payload;
  } catch {
    return { success: false, error: "unexpected_response" } as AuthUserPayload;
  }
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
  role: role === "admin" ? "admin" : role === "moderator" ? "moderator" : "user",
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

  let type: ProjectType | undefined;
  if (typeof candidate.type === "string") {
    const tNorm = candidate.type.toLowerCase();
    const allowedTypes: ProjectType[] = ["game", "website", "tool", "other"];
    if ((allowedTypes as string[]).includes(tNorm)) {
      type = tNorm as ProjectType;
    }
  }

  const getStr = (obj: unknown, key: string): string | undefined => {
    if (!obj || typeof obj !== "object") return undefined;
    const value = (obj as Record<string, unknown>)[key];
    return typeof value === "string" ? value : undefined;
  };

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
    logoUrl: getStr(candidate, "logoUrl") ?? getStr(candidate, "logo") ?? getStr(candidate, "image") ?? undefined,
    status,
  type,
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

export const createProject = async (
  { name, description, status, type, logoUrl }: Project,
  token: string
): Promise<Project | null> => {
  if (!token) {
    throw new Error("Yetkilendirme anahtarı eksik.");
  }

  const response = await fetch(PROJECTS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  body: JSON.stringify({ name, description, status, type, logoUrl }),
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response.json().catch(() => null)) as
    | { project?: unknown }
    | unknown;
  const project = (json && typeof json === "object" && "project" in json
    ? (json as { project?: unknown }).project
    : json) as unknown;
  return normalizeProject(project);
}

export const editProject = async({name,description,status, type}: Partial<Project>, projectId: string, token: string): Promise<Project | null> => {
  if (!token) {
    throw new Error("Yetkilendirme anahtarı eksik.");
  }

  if (!projectId) {
    throw new Error("Proje ID'si sağlanmadı.");
  }

  const response = await fetch(`${PROJECTS_API_URL}/${projectId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  body: JSON.stringify({ name, description, status, type }),
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response.json().catch(() => null)) as
    | { project?: unknown }
    | unknown;
  const project = (json && typeof json === "object" && "project" in json
    ? (json as { project?: unknown }).project
    : json) as unknown;
  return normalizeProject(project);
}

export const deleteProject = async(projectId: string, token: string): Promise<boolean> => {
  if (!token) {
    throw new Error("Yetkilendirme anahtarı eksik.");
  }

  if (!projectId) {
    throw new Error("Proje ID'si sağlanmadı.");
  }

  const response = await fetch(`${PROJECTS_API_URL}/${projectId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.ok;
};

// --- Project Stats ---
export type ProjectStat = { metric: string; day: string; value: number };

export const getProjectStats = async (
  projectId: string,
  token?: string
): Promise<ProjectStat[]> => {
  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${PROJECTS_API_URL}/${encodeURIComponent(projectId)}/stats`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = (await res.json().catch(() => null)) as { stats?: Array<{ metric?: string; day?: string; value?: number | string }> } | null;
    const list = Array.isArray(json?.stats) ? json!.stats! : [];
    return list
      .map((s) => ({ metric: String(s.metric ?? "generic"), day: String(s.day ?? ""), value: typeof s.value === "number" ? s.value : Number(s.value) || 0 }))
      .filter((s) => s.day.length > 0);
  } catch {
    return [];
  }
};

export const recordProjectStat = async (
  projectId: string,
  payload: { metric: string; value: number; day?: string },
  token: string
): Promise<boolean> => {
  const res = await fetch(`${PROJECTS_API_URL}/${encodeURIComponent(projectId)}/stats`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return res.ok;
};

// --- Blogs: create a new blog post (admin) ---
export const createBlog = async (
  payload: {
    title: string;
    content: string; // markdown or html
    excerpt?: string;
    image?: string; // thumbnail url
    categories?: string[]; // names or ids depending on backend
    author?: string;
  },
  token: string
): Promise<Blog | null> => {
  if (!token) throw new Error("Yetkilendirme anahtarı eksik.");

  // Backend expects token in the JSON body (not Authorization header)
  const response = await fetch(BLOGS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      title: payload.title,
      content: payload.content,
      image: payload.image ?? undefined,
      token, // required by backend to resolve author
    }),
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response
    .json()
    .catch(() => ({} as BlogSingleResponse))) as BlogSingleResponse;
  const normalized = normalizeBlog(json.post);
  return normalized ?? null;
};

export const uploadImage = async (
  dataUrl: string,
  token: string
): Promise<{ url?: string; dataUrl?: string; filename?: string } | null> => {
  if (!token) throw new Error("Yetkilendirme anahtarı eksik.");
  const res = await fetch(`${UPLOAD_API_URL}/image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ dataUrl }),
  });
  if (!res.ok) return null;
  const json = (await res.json().catch(() => null)) as
    | { success?: boolean; url?: unknown; dataUrl?: unknown; filename?: unknown }
    | null;
  if (!json || json.success !== true) return null;
  const out: { url?: string; dataUrl?: string; filename?: string } = {};
  if (typeof json.url === "string") out.url = json.url;
  if (typeof json.dataUrl === "string") out.dataUrl = json.dataUrl;
  if (typeof json.filename === "string") out.filename = json.filename;
  return out;
};

// Presigned upload (S3/MinIO)
export const presignUpload = async (
  params: { contentType: string; extension?: string; contentLength?: number; keyPrefix?: string },
  token: string
): Promise<{ url: string; method: string; key: string; publicUrl: string } | null> => {
  if (!token) throw new Error("Yetkilendirme anahtarı eksik.");
  const res = await fetch(`${UPLOAD_API_URL}/presign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      contentType: params.contentType,
      extension: params.extension,
      contentLength: params.contentLength,
      keyPrefix: params.keyPrefix ?? "blog/",
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json().catch(() => null)) as
    | { success?: boolean; url?: unknown; method?: unknown; key?: unknown; publicUrl?: unknown }
    | null;
  if (!json || json.success !== true || typeof json.url !== "string" || typeof json.key !== "string") return null;
  return {
    url: String(json.url),
    method: typeof json.method === "string" ? json.method : "PUT",
    key: String(json.key),
    publicUrl: typeof json.publicUrl === "string" ? json.publicUrl : "",
  };
};

export type ServerHealth = {
  status: "online" | "offline";
  uptimeSeconds?: number;
  memory?: { totalBytes: number; usedBytes: number };
  cpu?: { loadAvg1: number; loadAvg5: number; loadAvg15: number };
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

    type HealthJson = {
      status?: unknown;
      uptimeSeconds?: unknown;
      memory?: { totalBytes?: unknown; usedBytes?: unknown } | null;
      cpu?: { loadAvg1?: unknown; loadAvg5?: unknown; loadAvg15?: unknown } | null;
    };
    const json: HealthJson = (await response
      .json()
      .catch(() => ({} as HealthJson))) as HealthJson;
    const uptimeSeconds = parseUptime(
      typeof json.uptimeSeconds === "string" || typeof json.uptimeSeconds === "number"
        ? (json.uptimeSeconds as number | string)
        : undefined
    );
    const normalizedStatus =
      typeof json.status === "string" ? json.status.toLowerCase() : undefined;

    return {
      status:
        normalizedStatus === "ok" || normalizedStatus === "online"
          ? "online"
          : "offline",
      uptimeSeconds,
      memory:
        json.memory &&
        typeof json.memory.totalBytes === "number" &&
        typeof json.memory.usedBytes === "number"
          ? { totalBytes: json.memory.totalBytes, usedBytes: json.memory.usedBytes }
          : undefined,
      cpu:
        json.cpu &&
        typeof json.cpu.loadAvg1 === "number" &&
        typeof json.cpu.loadAvg5 === "number" &&
        typeof json.cpu.loadAvg15 === "number"
          ? {
              loadAvg1: json.cpu.loadAvg1,
              loadAvg5: json.cpu.loadAvg5,
              loadAvg15: json.cpu.loadAvg15,
            }
          : undefined,
    };
  } catch (error) {
    console.error("Failed to read server health", error);
    return { status: "offline" };
  }
};

// --- Analytics ---
export const incrementSiteVisit = async (): Promise<void> => {
  try {
    await fetch(`${ANALYTICS_API_URL}/visits/increment`, { method: "POST" });
  } catch {}
};

export const getVisits = async (token: string): Promise<{ date: string; count: number }[]> => {
  const res = await fetch(`${ANALYTICS_API_URL}/visits`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = (await res.json().catch(() => null)) as { visits?: { date: string; count: number }[] } | null;
  return Array.isArray(json?.visits) ? json!.visits! : [];
};

export const incrementBlogView = async (id: string | number): Promise<void> => {
  try {
    await fetch(`${ANALYTICS_API_URL}/blogs/${id}/increment`, { method: "POST" });
  } catch {}
};

export const getTopBlogViews = async (token: string): Promise<{ id: string; count: number }[]> => {
  const res = await fetch(`${ANALYTICS_API_URL}/blogs/top`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = (await res.json().catch(() => null)) as { top?: { id: string | number; count: string | number }[] } | null;
  const top = Array.isArray(json?.top) ? json!.top! : [];
  return top.map((t) => ({ id: String(t.id), count: Number(t.count) || 0 }));
};

// Per-page analytics
export const incrementPageView = async (path: string, ua?: string, country?: string): Promise<void> => {
  try {
    await fetch(`${ANALYTICS_API_URL}/page/increment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, ua: ua ?? "", country: country ?? "" }),
    });
  } catch {}
};

export const getTopPages = async (
  token: string
): Promise<{ path: string; count: number }[]> => {
  const res = await fetch(`${ANALYTICS_API_URL}/pages/top`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = (await res.json().catch(() => null)) as { top?: { path?: string; count?: string | number }[] } | null;
  const list = Array.isArray(json?.top) ? json!.top! : [];
  return list.map((i) => ({ path: String(i.path ?? "/"), count: Number(i.count ?? 0) || 0 }));
};

export const getTopAgents = async (
  token: string
): Promise<{ agent: string; count: number }[]> => {
  const res = await fetch(`${ANALYTICS_API_URL}/agents/top`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = (await res.json().catch(() => null)) as { top?: { agent?: string; count?: string | number }[] } | null;
  const list = Array.isArray(json?.top) ? json!.top! : [];
  return list.map((i) => ({ agent: String(i.agent ?? "Other"), count: Number(i.count ?? 0) || 0 }));
};

// Countries analytics
export const getTopCountries = async (
  token: string
): Promise<{ country: string; count: number }[]> => {
  const res = await fetch(`${ANALYTICS_API_URL}/countries/top`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = (await res.json().catch(() => null)) as { top?: { country?: string; count?: string | number }[] } | null;
  const list = Array.isArray(json?.top) ? json!.top! : [];
  return list.map((i) => ({ country: String(i.country ?? "Unknown"), count: Number(i.count ?? 0) || 0 }));
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

// --- FAQ (S.S.S.) ---
export type FaqItem = {
  id: string;
  locale: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  updatedAt?: string;
};

export const getFaqs = async (locale: string): Promise<FaqItem[]> => {
  const res = await fetch(`${API_BASE}/faq/${encodeURIComponent(locale)}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = (await res.json().catch(() => null)) as {
    items?: Array<{
      id?: string | number;
      locale?: string;
      question?: string;
      answer?: string;
      order?: number | string;
      isActive?: boolean;
      updatedAt?: string;
    }>;
  } | null;
  const list = Array.isArray(json?.items) ? json!.items! : [];
  return list
    .map((i) => ({
      id: String(i.id ?? ""),
      locale: i.locale ?? locale,
      question: i.question ?? "",
      answer: i.answer ?? "",
      order: typeof i.order === "string" ? Number(i.order) || 0 : (i.order ?? 0),
      isActive: Boolean(i.isActive ?? true),
      updatedAt: i.updatedAt,
    }))
    .filter((i) => i.id && i.question && i.answer);
};

export const createFaq = async (
  payload: { locale: string; question: string; answer: string; order?: number; isActive?: boolean },
  token: string
): Promise<FaqItem | null> => {
  const res = await fetch(`${API_BASE}/faq`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return null;
  const json = (await res.json().catch(() => null)) as { item?: unknown } | null;
  const it = json && typeof json === "object" && "item" in json ? (json as Record<string, unknown>).item : undefined;
  if (!it || typeof it !== "object") return null;
  const rec = it as Record<string, unknown>;
  const s = (v: unknown, fb = "") => (typeof v === "string" ? v : fb);
  const n = (v: unknown, fb = 0) => (typeof v === "number" ? v : typeof v === "string" ? Number(v) || fb : fb);
  const b = (v: unknown, fb = true) => (typeof v === "boolean" ? v : typeof v === "string" ? v === "true" || v === "1" : fb);
  return {
    id: s(rec.id, ""),
    locale: s(rec.locale, payload.locale),
    question: s(rec.question, payload.question),
    answer: s(rec.answer, payload.answer),
    order: n(rec.order, payload.order ?? 0),
    isActive: b(rec.isActive, payload.isActive ?? true),
    updatedAt: s(rec.updatedAt, undefined as unknown as string | undefined),
  };
};

export const updateFaq = async (
  id: string,
  patch: Partial<Pick<FaqItem, "locale" | "question" | "answer" | "order" | "isActive">>,
  token: string
): Promise<FaqItem | null> => {
  const res = await fetch(`${API_BASE}/faq/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(patch),
  });
  if (!res.ok) return null;
  const json = (await res.json().catch(() => null)) as { item?: unknown } | null;
  const it = json && typeof json === "object" && "item" in json ? (json as Record<string, unknown>).item : undefined;
  if (!it || typeof it !== "object") return null;
  const rec = it as Record<string, unknown>;
  const s = (v: unknown, fb = "") => (typeof v === "string" ? v : fb);
  const n = (v: unknown, fb = 0) => (typeof v === "number" ? v : typeof v === "string" ? Number(v) || fb : fb);
  const b = (v: unknown, fb = true) => (typeof v === "boolean" ? v : typeof v === "string" ? v === "true" || v === "1" : fb);
  return {
    id: s(rec.id, id),
    locale: s(rec.locale, patch.locale ?? "tr-TR"),
    question: s(rec.question, patch.question ?? ""),
    answer: s(rec.answer, patch.answer ?? ""),
    order: n(rec.order, patch.order ?? 0),
    isActive: b(rec.isActive, patch.isActive ?? true),
    updatedAt: s(rec.updatedAt, undefined as unknown as string | undefined),
  };
};

export const deleteFaq = async (id: string, token: string): Promise<boolean> => {
  const res = await fetch(`${API_BASE}/faq/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
};
