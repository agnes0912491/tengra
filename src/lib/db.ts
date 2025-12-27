import type { Blog, BlogCategory, BlogSEO, BlogStatus } from "@/types/blog";
import type { Project, ProjectStatus, ProjectType, ProjectPlatform, LocalizedContent } from "@/types/project";
import { Role, User, UserSource } from "./auth/users";
import { AuthUserPayload } from "@/types/auth";
import { resolveCdnUrl } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import { api } from "./api";

// Base API URL for the backend. Use environment variable in production.
const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  (typeof window === "undefined" ? "http://127.0.0.1:5000" : "http://localhost:5000");
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
  slug?: string;
  subtitle?: string;
  author_id?: number | string;
  author_name?: string;
  author?: string;
  editor?: string;
  title?: string;
  content?: string;
  html?: string;
  format?: string;
  createdAt?: string;
  updatedAt?: string;
  publishAt?: string;
  publishedAt?: string;
  unpublishAt?: string;
  status?: string;
  excerpt?: string;
  summary?: string;
  image?: string;
  heroImage?: string;
  coverAlt?: string;
  tags?: string[];
  categories?: Array<string | { name?: string; description?: string; slug?: string }>;
  seo?: BlogSEO;
  locale?: string;
  canonicalUrl?: string;
  views?: number;
  metrics?: {
    views?: number;
    likes?: number;
    reads?: number;
    bookmarks?: number;
  };
  pinned?: boolean;
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
      `Failed to fetch blog categories: HTTP ${response.status}${text ? ` - ${text}` : ""
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

const computeReadingTime = (text: string): number | undefined => {
  const words = text.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  if (!words) return undefined;
  return Math.max(1, Math.round(words / 180));
};

const normalizeBlogCategories = (rawCats: RawBlogPost["categories"]): BlogCategory[] => {
  if (!Array.isArray(rawCats)) return [];
  const mapped = rawCats.map((cat): { name: string; description: string; slug: string } | null => {
    if (typeof cat === "string") {
      return { name: cat, description: cat, slug: slugify(cat) };
    }
    if (cat && typeof cat === "object" && typeof cat.name === "string") {
      return {
        name: cat.name,
        description: cat.description ?? cat.name,
        slug: cat.slug ?? slugify(cat.name),
      };
    }
    return null;
  });
  return mapped.filter((c): c is { name: string; description: string; slug: string } => c !== null);
};

/**
 * Fetches all public blogs.
 */
const normalizeBlog = (raw: RawBlogPost | null | undefined): Blog | null => {
  if (!raw) return null;

  const id = raw.id ?? raw.slug ?? undefined;
  const title = raw.title?.trim() ?? undefined;
  const content = raw.content ?? raw.html ?? "";
  const createdAt = raw.createdAt ?? "";
  const updatedAt = raw.updatedAt ?? createdAt ?? "";

  if (id === undefined || title === undefined) return null;

  const format: "markdown" | "html" = raw.html ? "html" : /<[^>]+>/.test(content) ? "html" : "markdown";
  const publishAt = raw.publishAt ?? raw.publishedAt ?? createdAt ?? updatedAt ?? "";
  const date = publishAt || createdAt || new Date().toISOString();
  const excerpt = raw.summary ?? raw.excerpt ?? (content ? content.slice(0, 180) : "");
  const slug = raw.slug ?? (slugify(title) || String(id));
  const readingTime = computeReadingTime(content);
  const categories = normalizeBlogCategories(raw.categories);
  const tags = Array.isArray(raw.tags) ? raw.tags.map((t) => String(t)) : [];
  const author =
    (typeof raw.author === "string" && raw.author) ||
    (typeof raw.author_name === "string" && raw.author_name) ||
    (raw.author_id !== undefined ? String(raw.author_id) : "");
  const seo: BlogSEO = raw.seo ?? {
    title,
    description: excerpt,
    canonicalUrl:
      process.env.NEXT_PUBLIC_SITE_URL && slug ? `${process.env.NEXT_PUBLIC_SITE_URL}/blogs/${slug}` : undefined,
    ogImage: raw.image ?? raw.heroImage,
  };
  const metrics = raw.metrics ?? (raw.views ? { views: raw.views } : undefined);
  const canonicalUrl =
    raw.seo?.canonicalUrl ||
    raw.canonicalUrl ||
    (process.env.NEXT_PUBLIC_SITE_URL && slug ? `${process.env.NEXT_PUBLIC_SITE_URL}/blogs/${slug}` : undefined);

  return {
    id: String(id),
    title,
    subtitle: raw.subtitle,
    slug,
    date,
    author,
    excerpt,
    summary: raw.summary ?? excerpt,
    content,
    format,
    contentHtml: raw.html,
    image: raw.image ?? raw.heroImage ?? "",
    heroImage: raw.heroImage,
    coverAlt: raw.coverAlt,
    tags,
    categories,
    createdAt: createdAt || date,
    updatedAt: updatedAt || date,
    publishAt: publishAt || date,
    unpublishAt: undefined,
    status: (raw.status as BlogStatus) || "published",
    seo,
    metrics,
    featured: raw.pinned ?? false,
    locale: raw.locale,
    readingTimeMinutes: readingTime,
    canonicalUrl,
  };
};

export const getAllBlogs = async (): Promise<Blog[]> => {
  const response = await fetch(BLOGS_API_URL, { cache: "no-store" });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Failed to fetch blogs: HTTP ${response.status}${text ? ` - ${text}` : ""
      }`
    );
  }

  const raw = await response.text();
  let list: RawBlogPost[] = [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      list = parsed as RawBlogPost[];
    } else if (parsed && typeof parsed === "object" && Array.isArray((parsed as { posts?: unknown }).posts)) {
      list = (parsed as { posts: RawBlogPost[] }).posts;
    }
  } catch {
    list = [];
  }
  const posts: RawBlogPost[] = Array.isArray(list) ? list : [];

  return posts
    .map((post) => normalizeBlog(post))
    .filter((p): p is Blog => Boolean(p))
    .sort((a, b) => (b.publishAt ?? b.date).localeCompare(a.publishAt ?? a.date));
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
      `Failed to fetch blog ${id}: HTTP ${response.status}${text ? ` - ${text}` : ""
      }`
    );
  }

  const json = (await response
    .json()
    .catch(() => ({} as BlogSingleResponse))) as BlogSingleResponse;
  const normalized = normalizeBlog(json.post ?? (json as unknown as RawBlogPost));
  return normalized ?? null;
};

export const getAllUsers = async (token: string): Promise<User[]> => {
  if (!token) {
    throw new Error("Token sağlanmadı.");
  }

  const response = await api.get("/admin/users", {
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

  const mapAndNormalize = (list: unknown[]): User[] =>
    list
      .map((raw) => normalizeUser(raw as RawUser))
      .filter((u): u is User => Boolean(u));

  if (Array.isArray(json)) {
    return mapAndNormalize(json);
  }

  const asObj = json as { users?: unknown };
  if (Array.isArray(asObj.users)) {
    return mapAndNormalize(asObj.users);
  }

  // Unexpected shape
  throw new Error("Kullanıcı verisi beklenmeyen formatta döndü.");
};

// Presence API types
export type PresenceData = {
  userId: number;
  source: string;
  connectedAt: string;
  lastHeartbeat: string;
  socketCount?: number;
};

export type UserPresenceMap = Record<number, { online: boolean; source?: string; lastHeartbeat?: string }>;

/**
 * Get presence (online status) for specific users
 */
export const getUsersPresence = async (token: string, userIds: number[]): Promise<UserPresenceMap> => {
  if (!token || userIds.length === 0) {
    return {};
  }

  try {
    const response = await api.post("/admin/presence/check", { userIds }, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error("[presence] fetch error", response.status);
      return {};
    }

    const json = await response.json();
    if (json.success && json.presence) {
      return json.presence as UserPresenceMap;
    }
    return {};
  } catch (err) {
    console.error("[presence] error", err);
    return {};
  }
};

/**
 * Get all online users
 */
export const getAllOnlineUsers = async (token: string): Promise<PresenceData[]> => {
  if (!token) {
    return [];
  }

  try {
    const response = await api.get("/admin/presence", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error("[presence] fetch error", response.status);
      return [];
    }

    const json = await response.json();
    if (json.success && json.users) {
      return json.users as PresenceData[];
    }
    return [];
  } catch (err) {
    console.error("[presence] error", err);
    return [];
  }
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
    body: JSON.stringify({ email, password }),
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
  if (email) body.email = email;

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



export const uploadRegisterAvatar = async (file: Blob): Promise<string | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const res = await fetch(`${UPLOAD_API_URL}/register-avatar`, {
      method: "POST",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
      signal: controller.signal,
    });

    if (!res.ok) return null;
    const json = (await res.json().catch(() => null)) as { url?: string; success?: boolean } | null;
    if (json?.success && typeof json.url === "string") {
      return resolveCdnUrl(json.url);
    }
    return null;
  } catch (e) {
    if ((e as Error).name === "AbortError") {
      console.error("Avatar upload timeout after 30 seconds");
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
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
  createdAt?: string | null;
  updatedAt?: string | null;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  lastLoginDevice?: string | null;
  lastLoginCountry?: string | null;
  lastLoginCity?: string | null;
  source?: string | null;
  // Common snake_case fallbacks from backend
  last_login_at?: string | null;
  last_login_ip?: string | null;
  last_login_device?: string | null;
  last_login_country?: string | null;
  last_login_city?: string | null;
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

  // Normalize optional metadata
  const lastLoginAt =
    raw.lastLoginAt ??
    (raw as { last_login_at?: string | null }).last_login_at ??
    (raw as { lastLogin?: string | null }).lastLogin ??
    null;

  const lastLoginIp =
    raw.lastLoginIp ?? (raw as { last_login_ip?: string | null }).last_login_ip ?? null;
  const lastLoginDevice =
    raw.lastLoginDevice ?? (raw as { last_login_device?: string | null }).last_login_device ?? null;
  const lastLoginCountry =
    raw.lastLoginCountry ?? (raw as { last_login_country?: string | null }).last_login_country ?? null;
  const lastLoginCity =
    raw.lastLoginCity ?? (raw as { last_login_city?: string | null }).last_login_city ?? null;

  return {
    id: String(id),
    email,
    role: role === "admin" ? "admin" : role === "moderator" ? "moderator" : "user",
    username: raw.username ?? undefined,
    displayName: raw.displayName ?? raw.name ?? undefined,
    avatar: raw.avatar ?? undefined,
    createdAt: raw.createdAt ?? undefined,
    updatedAt: raw.updatedAt ?? undefined,
    lastLoginAt: lastLoginAt ?? undefined,
    lastLoginIp: lastLoginIp ?? undefined,
    lastLoginDevice: lastLoginDevice ?? undefined,
    lastLoginCountry: lastLoginCountry ?? undefined,
    lastLoginCity: lastLoginCity ?? undefined,
    source: raw.source ? (raw.source as UserSource) : undefined,
  };
};

export const getUserWithToken = async (token: string): Promise<User | null> => {
  if (!token) {
    throw new Error("Token sağlanmadı.");
  }

  const response = await api.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
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

// --- Contact submissions ---
export type ContactSubmission = {
  id?: string | number;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  ipAddress?: string;
  city?: string;
  country?: string;
  createdAt?: string;
};

const safeJsonParse = <T>(input: string): T | null => {
  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
};

// Some legacy project endpoints return malformed JSON when description includes raw quotes.
// Attempt a minimal repair so admin pages don't render a 404 despite existing data.
const repairProjectPayload = (raw: string): string | null => {
  if (!raw.includes("\"description\"")) return null;

  const fixed = raw.replace(
    /"description"\s*:\s*"({[\s\S]*?})"/,
    (_match, inner) => `"description": ${JSON.stringify(inner)}`
  );

  return fixed === raw ? null : fixed;
};

const normalizeProject = (project: unknown): Project | null => {
  if (!project || typeof project !== "object") {
    return null;
  }

  const candidate = project as Record<string, unknown>;
  const isRecord = (val: unknown): val is Record<string, unknown> =>
    Boolean(val) && typeof val === "object" && !Array.isArray(val);
  const normalizeLocaleMap = (input: unknown): Record<string, string> | undefined => {
    if (!isRecord(input)) return undefined;
    const cleaned: Record<string, string> = {};
    for (const [key, value] of Object.entries(input)) {
      if (typeof value === "string" && value.trim().length > 0) {
        cleaned[key] = value;
      }
    }
    return Object.keys(cleaned).length ? cleaned : undefined;
  };
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
    const allowedTypes: ProjectType[] = ["game", "website", "tool", "app", "library", "other"];
    if ((allowedTypes as string[]).includes(tNorm)) {
      type = tNorm as ProjectType;
    }
  }

  const getStr = (obj: unknown, key: string): string | undefined => {
    if (!obj || typeof obj !== "object") return undefined;
    const value = (obj as Record<string, unknown>)[key];
    return typeof value === "string" ? value : undefined;
  };

  const getNum = (obj: unknown, key: string): number | undefined => {
    if (!obj || typeof obj !== "object") return undefined;
    const value = (obj as Record<string, unknown>)[key];
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  };

  const getArray = (obj: unknown, key: string): unknown[] | undefined => {
    if (!obj || typeof obj !== "object") return undefined;
    const value = (obj as Record<string, unknown>)[key];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return undefined;
      }
    }
    return undefined;
  };

  let descriptionsByLocale = normalizeLocaleMap(
    (candidate as { descriptionsByLocale?: unknown }).descriptionsByLocale
  );

  let description: string | LocalizedContent | null | undefined;
  if (typeof candidate.description === "string") {
    const rawDesc = candidate.description;
    try {
      const parsed = JSON.parse(rawDesc);
      if (isRecord(parsed)) {
        description = parsed as LocalizedContent;
        descriptionsByLocale = descriptionsByLocale ?? normalizeLocaleMap(parsed);
      } else {
        description = rawDesc;
      }
    } catch {
      description = rawDesc;
    }
  } else if (isRecord(candidate.description)) {
    description = candidate.description as LocalizedContent;
    descriptionsByLocale = descriptionsByLocale ?? normalizeLocaleMap(candidate.description);
  } else if (typeof candidate.summary === "string" && candidate.summary.trim().length > 0) {
    description = candidate.summary;
  }

  if (!description && descriptionsByLocale) {
    description = descriptionsByLocale;
  }

  const out: Project = {
    id: String(id),
    name: String(name),
    slug: candidate.slug ? String(candidate.slug) : undefined,
    description,
    descriptionsByLocale,
    logoUrl:
      getStr(candidate, "logoUrl") ??
      getStr(candidate, "logo") ??
      getStr(candidate, "image") ??
      undefined,
    status,
    type,
    // App Store fields
    tagline: getStr(candidate, "tagline"),
    version: getStr(candidate, "version"),
    links: getArray(candidate, "links") as Project["links"],
    platforms: getArray(candidate, "platforms") as ProjectPlatform[] | undefined,
    categories: getArray(candidate, "categories") as string[] | undefined,
    screenshots: getArray(candidate, "screenshots") as Project["screenshots"],
    features: getArray(candidate, "features") as Project["features"],
    rating: getNum(candidate, "rating"),
    reviewCount: getNum(candidate, "reviewCount"),
    downloadCount: getNum(candidate, "downloadCount"),
    viewCount: getNum(candidate, "viewCount"),
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
  return out;
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

    const json = await response.json().catch(() => ({ projects: [] }));

    // New API returns {projects: [...]}
    const projectsArray = Array.isArray(json) ? json : (json.projects || []);

    return projectsArray
      .map((item: unknown) => normalizeProject(item))
      .filter((item: Project | null): item is Project => Boolean(item));
  } catch (error) {
    console.error("Failed to fetch projects", error);
    return [];
  }
};

export const createProject = async (
  data: Partial<Project> & { name: string },
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
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response.json().catch(() => null)) as
    | { project?: unknown }
    | unknown;
  const project =
    json && typeof json === "object" && "project" in json
      ? (json as { project?: unknown }).project
      : (json as unknown);
  return normalizeProject(project);
};

export const getProjectById = async (
  projectId: string,
  token?: string
): Promise<Project | null> => {
  if (!projectId) return null;
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(
      `${PROJECTS_API_URL}/${encodeURIComponent(projectId)}`,
      {
        headers,
        cache: "no-store",
      }
    );
    if (!response.ok) {
      return null;
    }
    const rawText = await response.text().catch(() => "");
    const repaired = repairProjectPayload(rawText);
    const json =
      safeJsonParse<{ project?: unknown } | unknown>(rawText) ??
      (repaired ? safeJsonParse<{ project?: unknown } | unknown>(repaired) : null);

    if (!json) {
      return null;
    }

    const project =
      json && typeof json === "object" && "project" in json
        ? (json as { project?: unknown }).project
        : (json as unknown);
    return normalizeProject(project);
  } catch {
    return null;
  }
};

export const editProject = async (
  { name, description, status, type, logoUrl }: Partial<Project>,
  projectId: string,
  token: string
): Promise<Project | null> => {
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
    body: JSON.stringify({ name, description, status, type, logoUrl }),
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response.json().catch(() => null)) as
    | { project?: unknown }
    | unknown;
  const project =
    json && typeof json === "object" && "project" in json
      ? (json as { project?: unknown }).project
      : (json as unknown);
  return normalizeProject(project);
};

export const deleteProject = async (projectId: string, token: string): Promise<boolean> => {
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

export const recordProjectVisit = async (
  projectId: string,
  path?: string,
  token?: string
): Promise<boolean> => {
  if (!projectId) return false;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(
      `${PROJECTS_API_URL}/${encodeURIComponent(projectId)}/visits`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(path ? { path } : {}),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
};

// --- Contact submissions ---
export async function registerUser({
  username,
  email,
  password,
  firstName,
  lastName,
  avatarUrl,
  idToken, // Add idToken
}: {
  username: string;
  email: string;
  password?: string; // Make password optional if Google (though we might enforce it)
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  idToken?: string;
}) {
  console.log("Registering user:", username, email);

  // Use consistent API endpoint via Next.js proxy
  // This forwards to the appropriate backend (localhost:5000)
  const endpoint = `/api/auth/register`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email,
      password,
      firstName,
      lastName,
      avatarUrl,
      idToken,
      source: idToken ? "web_client_google" : "web_client", // Add source
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("Registration failed:", errorData);
    throw new Error(errorData.message || errorData.error || "Registration failed");
  }

  return res.json();
};

export const createContactSubmission = async (
  payload: { name: string; email: string; subject: string; message: string; phone?: string; ipAddress?: string; city?: string; country?: string }
): Promise<ContactSubmission | null> => {
  const res = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return null;
  const json = (await res.json().catch(() => null)) as { item?: ContactSubmission } | null;
  return (json && json.item) || null;
};

export const getContactSubmissions = async (token: string): Promise<ContactSubmission[]> => {
  if (!token) return [];
  const res = await fetch(`${API_BASE}/contact`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) return [];
  const json = (await res.json().catch(() => null)) as { items?: ContactSubmission[] } | null;
  return Array.isArray(json?.items) ? json!.items! : [];
};

export const deleteContactSubmission = async (id: string | number, token: string): Promise<boolean> => {
  if (!token) return false;
  const res = await fetch(`${API_BASE}/contact/${encodeURIComponent(String(id))}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.ok;
};

// --- Contact subscriptions ---
export const createContactSubscription = async (email: string): Promise<{ id?: string | number; email?: string; createdAt?: string } | null> => {
  const res = await fetch(`${API_BASE}/contact/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) return null;
  const json = (await res.json().catch(() => null)) as { item?: { id?: string | number; email?: string; createdAt?: string } } | null;
  return (json && json.item) || null;
};

export const getContactSubscriptions = async (token: string): Promise<Array<{ id: string | number; email: string; createdAt?: string }>> => {
  if (!token) return [];
  const res = await fetch(`${API_BASE}/contact/subscriptions`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) return [];
  const json = (await res.json().catch(() => null)) as { items?: Array<{ id: string | number; email: string; createdAt?: string }> } | null;
  return Array.isArray(json?.items) ? json!.items! : [];
};

export const deleteContactSubscription = async (id: string | number, token: string): Promise<boolean> => {
  if (!token) return false;
  const res = await fetch(`${API_BASE}/contact/subscriptions/${encodeURIComponent(String(id))}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.ok;
};

// --- Blogs: create a new blog post (admin) ---
export type BlogSavePayload = {
  id?: string | number;
  title: string;
  slug?: string;
  subtitle?: string;
  content: string; // markdown or html
  format?: "markdown" | "html";
  excerpt?: string;
  image?: string; // thumbnail url
  heroImage?: string;
  coverAlt?: string;
  categories?: string[]; // names or ids depending on backend
  tags?: string[];
  status?: BlogStatus;
  publishAt?: string;
  seo?: BlogSEO;
  author?: string;
};

const buildBlogRequestBody = (payload: BlogSavePayload, token: string) => ({
  title: payload.title,
  slug: payload.slug ?? slugify(payload.title),
  subtitle: payload.subtitle,
  content: payload.content,
  format: payload.format ?? "markdown",
  excerpt: payload.excerpt,
  image: payload.image ?? payload.heroImage ?? undefined,
  heroImage: payload.heroImage ?? undefined,
  coverAlt: payload.coverAlt ?? undefined,
  categories: payload.categories ?? undefined,
  tags: payload.tags ?? undefined,
  status: payload.status ?? undefined,
  publishAt: payload.publishAt ?? undefined,
  seo: payload.seo ?? undefined,
  token, // required by backend to resolve author
});

export const createBlog = async (payload: BlogSavePayload, token: string): Promise<Blog | null> => {
  if (!token) throw new Error("Yetkilendirme anahtarı eksik.");

  const response = await fetch(BLOGS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(buildBlogRequestBody(payload, token)),
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response
    .json()
    .catch(() => ({} as BlogSingleResponse))) as BlogSingleResponse;
  const normalized = normalizeBlog(json.post ?? (json as unknown as RawBlogPost));
  return normalized ?? null;
};

export const updateBlog = async (
  id: string | number,
  payload: BlogSavePayload,
  token: string
): Promise<Blog | null> => {
  if (!token) throw new Error("Yetkilendirme anahtarı eksik.");

  const response = await fetch(`${BLOGS_API_URL}/${encodeURIComponent(String(id))}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(buildBlogRequestBody({ ...payload, id }, token)),
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response
    .json()
    .catch(() => ({} as BlogSingleResponse))) as BlogSingleResponse;
  const normalized = normalizeBlog(json.post ?? (json as unknown as RawBlogPost));
  return normalized ?? null;
};

export const uploadImage = async (
  dataUrl: string,
  token: string
): Promise<{ url?: string; dataUrl?: string; filename?: string } | null> => {
  if (!token) throw new Error("Yetkilendirme anahtarı eksik.");

  // Convert data URL to blob (without fetch to avoid CSP issues)
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  const blob = new Blob([u8arr], { type: mime });

  // Convert blob to File object
  const file = new File([blob], "upload.png", { type: mime });

  // Upload to CDN
  const { uploadPostImage } = await import("@/lib/cdn");
  const result = await uploadPostImage(file, token);

  if (!result || !result.url) return null;

  return {
    url: result.url,
    dataUrl,
    filename: result.id + ".png"
  };
};

export const uploadProjectImage = async (
  dataUrl: string,
  token: string
): Promise<{ url?: string; dataUrl?: string; filename?: string } | null> => {
  if (!token) throw new Error("Yetkilendirme anahtarı eksik.");

  // Convert data URL to blob (without fetch to avoid CSP issues)
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  const blob = new Blob([u8arr], { type: mime });

  // Convert blob to File object
  const file = new File([blob], "upload.png", { type: mime });

  // Upload to CDN
  const { uploadProjectImage } = await import("@/lib/cdn");
  const result = await uploadProjectImage(file, token);

  if (!result || !result.url) return null;

  return {
    url: result.url,
    dataUrl,
    filename: result.id + ".png"
  };
};

const postJson = async (url: string, body: unknown) => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  return res;
};

export const requestPasswordReset = async (email: string): Promise<boolean> => {
  const endpoints = [`${API_BASE}/account/forgot-password`, `${API_BASE}/auth/forgot-password`];
  for (const url of endpoints) {
    try {
      const res = await postJson(url, { email });
      if (res.ok) return true;
    } catch {
      // try next
    }
  }
  return false;
};

export const resetPassword = async (token: string, password: string): Promise<boolean> => {
  const endpoints = [`${API_BASE}/account/reset-password`, `${API_BASE}/auth/reset-password`];
  for (const url of endpoints) {
    try {
      const res = await postJson(url, { token, password });
      if (res.ok) return true;
    } catch {
      // try next
    }
  }
  return false;
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
  } catch { }
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
    const payload =
      typeof window !== "undefined"
        ? {
          country: (() => {
            const locale = navigator.language || "";
            const parts = locale.split(/[-_]/);
            return parts.length > 1 ? parts[1].toUpperCase() : "";
          })(),
          path: window.location.pathname,
          referrer: document.referrer || "",
          ua: navigator.userAgent || "",
          language: navigator.language || "",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
          screen: `${window.screen?.width ?? 0}x${window.screen?.height ?? 0}`,
        }
        : {};
    await fetch(`${ANALYTICS_API_URL}/blogs/${id}/increment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch { }
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
    // Skip obviously malicious paths from analytics
    const lowered = (path || "").toLowerCase();
    if (lowered.includes("/cgi-bin") || lowered.includes("stok=")) {
      return;
    }
    const payload = { path, ua: ua ?? "", country: country ?? "" };
    // Fire page-level increment and aggregate visits counter in parallel
    await Promise.all([
      fetch(`${ANALYTICS_API_URL}/page/increment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      fetch(`${ANALYTICS_API_URL}/visits/increment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    ]);
  } catch { }
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

// Active agents (live visitors) – backend endpoint expected to return:
// { agents: [{ id, agent, startedAt, lastSeenAt, pages: string[] }] }
export type ActiveAgent = {
  id: string;
  agent: string;
  startedAt?: string;
  lastSeenAt?: string;
  pages?: string[];
  accepted?: number;
  declined?: number;
};

export const getActiveAgents = async (token: string): Promise<ActiveAgent[]> => {
  if (!token) return [];
  const res = await fetch(`${ANALYTICS_API_URL}/agents/active`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = (await res.json().catch(() => null)) as { agents?: ActiveAgent[] } | ActiveAgent[] | null;
  if (!json) return [];
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.agents)) return json.agents;
  return [];
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

  const response = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
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
      `Kullanıcı rolü güncellenemedi: HTTP ${response.status}${text ? ` - ${text}` : ""
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

export const updateUser = async (
  userId: string,
  data: { displayName?: string; email?: string; phone?: string; bio?: string },
  token: string
): Promise<boolean> => {
  if (!userId || !token) throw new Error("Eksik veri.");

  const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return response.ok;
};

export const updateMe = async (
  data: { displayName?: string; email?: string; username?: string; avatar?: string; bio?: string },
  token: string
): Promise<boolean> => {
  if (!token) throw new Error("Token eksik.");

  const response = await fetch(`${API_BASE}/users/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return response.ok;
};

export const deleteUser = async (userId: string, token: string): Promise<boolean> => {
  if (!token) throw new Error("Token eksik.");
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
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
  const rawId = rec.id;
  return {
    // Backend dönen id değeri sayı da olabildiği için,
    // hem string hem number durumlarını güvenli şekilde stringe çeviriyoruz.
    id: typeof rawId === "string" || typeof rawId === "number" ? String(rawId) : "",
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

export const createAdminUser = async (data: Record<string, unknown>, token: string): Promise<User | null> => {
  if (!token) throw new Error("Token eksik.");
  const res = await fetch(`${API_BASE}/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return normalizeUser(json.user);
};

export const updateAdminUser = async (userId: string, data: Record<string, unknown>, token: string): Promise<User | null> => {
  if (!token) throw new Error("Token eksik.");
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return normalizeUser(json.user);
};

export type VideoSupportCheck = {
  supported: boolean;
  platform?: string;
  formats?: string[];
  toolAvailable?: boolean;
  message?: string;
  error?: string;
};

export type VideoDownloadResult = {
  success: boolean;
  platform?: string;
  format?: string;
  downloadUrl?: string;
  note?: string;
  error?: string;
};

const normalizeStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const cleaned = value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  return cleaned.length ? cleaned : undefined;
};

export const checkVideoSupport = async (url: string, token: string): Promise<VideoSupportCheck> => {
  if (!url || !token) {
    return { supported: false, message: "URL ve token gerekli", error: "missing_parameters" };
  }

  const response = await fetch(`${API_BASE}/videos/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url }),
  });

  const json = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    const message =
      typeof json.error === "string"
        ? json.error
        : typeof json.message === "string"
          ? json.message
          : `Kontrol başarısız (HTTP ${response.status})`;
    return { supported: false, message, error: message };
  }

  return {
    supported: json.supported === true,
    platform: typeof json.platform === "string" ? json.platform : undefined,
    formats: normalizeStringArray(json.formats),
    toolAvailable: json.toolAvailable !== false,
    message: typeof json.message === "string" ? json.message : undefined,
  };
};

export const requestVideoDownload = async (params: { url: string; format: string; token: string }): Promise<VideoDownloadResult> => {
  const { url, format, token } = params;
  if (!url || !format || !token) {
    return { success: false, error: "URL, format ve token gerekli" };
  }

  const response = await fetch(`${API_BASE}/videos/download`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url, format }),
  });

  const json = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    const message =
      typeof json.error === "string"
        ? json.error
        : typeof json.message === "string"
          ? json.message
          : `İndirme isteği reddedildi (HTTP ${response.status})`;
    return { success: false, error: message };
  }

  return {
    success: json.success !== false,
    platform: typeof json.platform === "string" ? json.platform : undefined,
    format: typeof json.format === "string" ? json.format : undefined,
    downloadUrl: typeof json.downloadUrl === "string" ? json.downloadUrl : undefined,
    note: typeof json.note === "string" ? json.note : undefined,
    error: typeof json.error === "string" ? json.error : undefined,
  };
};
