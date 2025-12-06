export type ProjectStatus =
  | "draft"
  | "in_progress"
  | "on_hold"
  | "completed"
  | "archived";

export type ProjectType = "game" | "website" | "tool" | "app" | "library" | "other";

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

export type Project = {
  id?: string;
  name: string;
  slug?: string;
  
  // Basic info
  tagline?: string | null; // Short catchy phrase like "Build the future"
  description?: string | null;
  descriptionsByLocale?: Record<string, string> | null;
  
  // Visual assets
  logoUrl?: string | null;
  bannerUrl?: string | null; // Hero banner image
  iconUrl?: string | null; // App icon (square)
  
  // Screenshots/Gallery
  screenshots?: ProjectScreenshot[];
  
  // Features list
  features?: ProjectFeature[];
  
  // External links
  links?: ProjectLink[];
  
  // Metadata
  status?: ProjectStatus;
  type?: ProjectType;
  version?: string | null; // e.g., "1.2.3"
  releaseDate?: string | null;
  
  // Platform support
  platforms?: ProjectPlatform[];
  
  // Categories/Tags
  categories?: string[];
  tags?: string[];
  
  // Stats (read-only, computed from analytics)
  downloadCount?: number;
  viewCount?: number;
  rating?: number; // 0-5
  reviewCount?: number;
  
  // Technical info
  minRequirements?: string | null;
  techStack?: string[];
  
  // SEO
  metaTitle?: string | null;
  metaDescription?: string | null;
  
  // Timestamps
  lastUpdatedAt?: string | null;
  createdAt?: string | null;
};

 
