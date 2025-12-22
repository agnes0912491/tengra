export type ProjectStatus =
  | "draft"
  | "in_progress"
  | "on_hold"
  | "completed"
  | "published"
  | "archived";

export type ProjectType = "game" | "website" | "tool" | "app" | "mobile" | "library" | "other";

export type ProjectPlatform = "windows" | "macos" | "linux" | "android" | "ios" | "web" | "steam" | "discord";

export type ProjectScreenshot = {
  id?: string;
  projectId?: string; // Optional for new items before save
  url: string;
  caption?: string | null;
  order: number;
};

export type ProjectFeature = {
  id?: string;
  projectId?: string; // Optional for new items before save
  icon?: string | null;
  title: string;
  description?: string | null;
  order: number;
};

export type ProjectLink = {
  id?: string;
  projectId?: string; // Optional for new items before save
  type: "website" | "download" | "github" | "discord" | "steam" | "appstore" | "playstore" | "docs" | "other";
  url: string;
  label?: string | null;
};

// New API Response Types
export type LocalizedContent = {
  en?: string;
  tr?: string;
  [key: string]: string | undefined;
};

export type ProjectImages = {
  logo: string | null;
  banner: string | null;
  icon: string | null;
};

export type ProjectMetadata = {
  version: string | null;
  releaseDate: string | null;
  platforms: string[] | null;
  categories: string[] | null;
  tags: string[] | null;
};

export type ProjectStats = {
  downloads: number;
  views: number;
  reviews: number;
  rating: number;
};

export type Project = {
  id: number | string;
  name: string;
  slug?: string;
  
  // Basic info
  type?: ProjectType;
  status?: ProjectStatus;
  tagline?: LocalizedContent | string | null;
  description?: LocalizedContent | string | null;
  
  // New nested structures from API
  images?: ProjectImages;
  metadata?: ProjectMetadata;
  stats?: ProjectStats;
  links?: any; // JSON object
  techStack?: any; // JSON array
  features?: any; // JSON array
  
  // Legacy fields (for backwards compatibility)
  descriptionsByLocale?: Record<string, string> | null;
  logoUrl?: string | null;
  bannerUrl?: string | null; // Hero banner image
  iconUrl?: string | null; // App icon (square)
  screenshots?: ProjectScreenshot[];
  version?: string | null; // e.g., "1.2.3"
  releaseDate?: string | null;
  platforms?: ProjectPlatform[];
  categories?: string[];
  tags?: string[];
  downloadCount?: number;
  viewCount?: number;
  rating?: number; // 0-5
  reviewCount?: number;
  minRequirements?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  lastUpdatedAt?: string | null;
  createdAt?: string | null;
};

 
