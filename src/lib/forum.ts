import { ForumCategory, ForumOnlineUser, ForumPost, ForumThread, ForumUser } from "@/types/forum";

const API_BASE =
  typeof window === "undefined"
    ? "http://127.0.0.1:5000"
    : process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000";

const FORUM_API_URL = `${API_BASE}/forum`;
const FRONTEND_FORUM_KEY = process.env.NEXT_PUBLIC_FORUM_FRONTEND_KEY || "";

const appendKey = (url: string) => {
  if (!FRONTEND_FORUM_KEY) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}frontendKey=${encodeURIComponent(FRONTEND_FORUM_KEY)}`;
};

type RawEntity = Record<string, unknown>;

const toNumber = (value: unknown): number => {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
};

const mapUser = (raw: RawEntity | null | undefined): ForumUser => ({
  id: toNumber((raw?.id as number | string | undefined) ?? 0),
  username: (raw?.username as string) ?? (raw?.displayName as string) ?? "",
  displayName: (raw?.displayName as string) ?? (raw?.username as string) ?? null,
  avatar: (raw?.avatar as string) ?? null,
  role: ((raw?.role as ForumUser["role"]) ?? "user") as ForumUser["role"],
});

const mapThread = (raw: RawEntity): ForumThread => ({
  id: toNumber(raw?.id ?? 0),
  categoryId: raw?.categoryId ? toNumber(raw.categoryId as number | string) : undefined,
  authorId: raw?.authorId ? toNumber(raw.authorId as number | string) : undefined,
  title: (raw?.title as string) ?? "",
  slug: (raw?.slug as string) ?? undefined,
  content: (raw?.content as string) ?? "",
  isLocked: Boolean(raw?.isLocked),
  isPinned: Boolean(raw?.isPinned),
  replyCount: raw?.replyCount !== undefined ? toNumber(raw.replyCount as number | string) : undefined,
  createdAt: (raw?.createdAt as string) ?? undefined,
  updatedAt: (raw?.updatedAt as string) ?? (raw?.lastReplyAt as string | undefined) ?? undefined,
  lastReplyAt: (raw?.lastReplyAt as string) ?? (raw?.updatedAt as string | undefined) ?? undefined,
  author: raw?.author ? mapUser(raw.author as RawEntity) : undefined,
  category: raw?.category ? mapCategory(raw.category as RawEntity) : undefined,
  lastReplyAuthor: raw?.lastReplyAuthor ? mapUser(raw.lastReplyAuthor as RawEntity) : undefined,
});

const mapCategory = (raw: RawEntity): ForumCategory => ({
  id: toNumber(raw?.id ?? 0),
  name: (raw?.name as string) ?? "",
  slug: (raw?.slug as string) ?? "",
  description: (raw?.description as string) ?? "",
  icon: (raw?.icon as string) ?? null,
  color: (raw?.color as string) ?? null,
  sortOrder: raw?.sortOrder !== undefined ? Number(raw.sortOrder) : undefined,
  isLocked: Boolean(raw?.isLocked),
  isHidden: Boolean(raw?.isHidden),
  threadCount: raw?.threadCount !== undefined ? toNumber(raw.threadCount as number | string) : undefined,
  postCount: raw?.postCount !== undefined ? toNumber(raw.postCount as number | string) : undefined,
  lastThreadId: raw?.lastThreadId ? toNumber(raw.lastThreadId as number | string) : undefined,
  lastPostAt: (raw?.lastPostAt as string) ?? null,
  lastActivityAt: (raw?.lastActivityAt as string) ?? null,
  createdAt: (raw?.createdAt as string) ?? undefined,
  updatedAt: (raw?.updatedAt as string) ?? undefined,
  lastThread: raw?.lastThread ? mapThread(raw.lastThread as RawEntity) : undefined,
});

const mapPost = (raw: RawEntity): ForumPost => ({
  id: toNumber(raw?.id ?? 0),
  threadId: toNumber(raw?.threadId ?? 0),
  authorId: raw?.authorId ? toNumber(raw.authorId as number | string) : undefined,
  content: (raw?.content as string) ?? "",
  createdAt: (raw?.createdAt as string) ?? undefined,
  updatedAt: (raw?.updatedAt as string) ?? undefined,
  author: raw?.author ? mapUser(raw.author as RawEntity) : undefined,
});

const mapOnlineUser = (raw: RawEntity): ForumOnlineUser => ({
  id: toNumber(raw?.id ?? 0),
  username: (raw?.username as string) ?? "",
  displayName: (raw?.displayName as string) ?? "",
  role: ((raw?.role as ForumOnlineUser["role"]) ?? "user") as ForumOnlineUser["role"],
  lastSeenAt: (raw?.lastSeenAt as string) ?? "",
  device: (raw?.device as string) ?? undefined,
});

export async function fetchForumCategories(): Promise<ForumCategory[]> {
  const res = await fetch(appendKey(`${FORUM_API_URL}/categories`), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch forum categories (${res.status})`);
  }
  const json = (await res.json().catch(() => ({}))) as { items?: unknown[] };
  if (!Array.isArray(json.items)) return [];
  return json.items.map((item) => mapCategory(item as RawEntity));
}

export async function fetchForumThreads(
  slug: string,
  opts: { page?: number; pageSize?: number } = {}
): Promise<{ category?: ForumCategory; items: ForumThread[]; page: number; pageSize: number }> {
  const params = new URLSearchParams();
  if (opts.page) params.set("page", String(opts.page));
  if (opts.pageSize) params.set("pageSize", String(opts.pageSize));
  const qs = params.toString();
  const url = appendKey(`${FORUM_API_URL}/categories/${slug}/threads${qs ? `?${qs}` : ""}`);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load threads (${res.status})`);
  }
  const json = (await res.json().catch(() => ({}))) as { category?: unknown; items?: unknown[]; page?: number; pageSize?: number };
  return {
    category: json.category ? mapCategory(json.category as RawEntity) : undefined,
    items: Array.isArray(json.items) ? json.items.map((item) => mapThread(item as RawEntity)) : [],
    page: json.page ?? 1,
    pageSize: json.pageSize ?? opts.pageSize ?? 25,
  };
}

export async function fetchThreadDetail(
  id: string | number
): Promise<{ thread?: ForumThread; category?: ForumCategory; posts: ForumPost[] }> {
  const res = await fetch(appendKey(`${FORUM_API_URL}/threads/${id}`), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load thread (${res.status})`);
  }
  const json = (await res.json().catch(() => ({}))) as { thread?: unknown; category?: unknown; posts?: unknown[] };
  return {
    thread: json.thread ? mapThread(json.thread as RawEntity) : undefined,
    category: json.category ? mapCategory(json.category as RawEntity) : undefined,
    posts: Array.isArray(json.posts) ? json.posts.map((post) => mapPost(post as RawEntity)) : [],
  };
}

export async function createForumThread(
  categorySlug: string,
  title: string,
  content: string,
  token: string
): Promise<ForumThread | null> {
  const res = await fetch(appendKey(`${FORUM_API_URL}/categories/${categorySlug}/threads`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content, frontendKey: FRONTEND_FORUM_KEY }),
  });
  if (!res.ok) {
    return null;
  }
  const json = (await res.json().catch(() => ({}))) as { thread?: unknown };
  return json.thread ? mapThread(json.thread as RawEntity) : null;
}

export async function createForumPost(threadId: string | number, content: string, token: string): Promise<ForumPost | null> {
  const res = await fetch(appendKey(`${FORUM_API_URL}/threads/${threadId}/posts`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content, frontendKey: FRONTEND_FORUM_KEY }),
  });
  if (!res.ok) {
    return null;
  }
  const json = (await res.json().catch(() => ({}))) as { post?: unknown };
  return json.post ? mapPost(json.post as RawEntity) : null;
}

export async function fetchOnlineUsers(): Promise<ForumOnlineUser[]> {
  const res = await fetch(appendKey(`${FORUM_API_URL}/online`), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch online users (${res.status})`);
  }
  const json = (await res.json().catch(() => ({}))) as { items?: unknown[] };
  if (!Array.isArray(json.items)) return [];
  return json.items.map((item) => mapOnlineUser(item as RawEntity));
}

// Admin endpoints
export async function adminFetchForumCategories(token: string): Promise<ForumCategory[]> {
  const res = await fetch(appendKey(`${FORUM_API_URL}/admin/categories`), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch forum categories (${res.status})`);
  }
  const json = (await res.json().catch(() => ({}))) as { items?: unknown[] };
  if (!Array.isArray(json.items)) return [];
  return json.items.map((item) => mapCategory(item as RawEntity));
}

export type AdminCategoryInput = {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
  isHidden?: boolean;
  isLocked?: boolean;
};

export async function adminUpdateCategory(id: number, input: AdminCategoryInput, token: string): Promise<ForumCategory[]> {
  const res = await fetch(appendKey(`${FORUM_API_URL}/admin/categories/${id}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(`Failed to update category (${res.status})`);
  }
  const json = (await res.json().catch(() => ({}))) as { items?: unknown[] };
  return Array.isArray(json.items) ? json.items.map((item) => mapCategory(item as RawEntity)) : [];
}

export async function adminCreateCategory(input: AdminCategoryInput & { name: string }, token: string): Promise<ForumCategory[]> {
  const res = await fetch(appendKey(`${FORUM_API_URL}/admin/categories`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(`Failed to create category (${res.status})`);
  }
  const json = (await res.json().catch(() => ({}))) as { items?: unknown[] };
  return Array.isArray(json.items) ? json.items.map((item) => mapCategory(item as RawEntity)) : [];
}
