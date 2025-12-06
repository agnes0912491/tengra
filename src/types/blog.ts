export type BlogStatus = "draft" | "published" | "scheduled" | "archived";

export interface BlogCategory {
  name: string;
  description: string;
  slug?: string;
}

export interface BlogSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
}

export interface BlogMetrics {
  views?: number;
  likes?: number;
  reads?: number;
  bookmarks?: number;
}

export interface BlogAuthor {
  name: string;
  avatar?: string;
  role?: string;
}

export interface Blog {
  id: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  content: string;
  image: string;
  categories: BlogCategory[];
  createdAt: string;
  updatedAt: string;

  slug?: string;
  subtitle?: string;
  heroImage?: string;
  coverAlt?: string;
  format?: "markdown" | "html";
  contentHtml?: string;
  readingTimeMinutes?: number;
  tags?: string[];
  status?: BlogStatus;
  publishAt?: string;
  unpublishAt?: string;
  seo?: BlogSEO;
  metrics?: BlogMetrics;
  featured?: boolean;
  locale?: string;
  canonicalUrl?: string;
  authorInfo?: BlogAuthor;
  summary?: string;
}
