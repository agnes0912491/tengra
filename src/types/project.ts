export type ProjectStatus =
  | "draft"
  | "in_progress"
  | "on_hold"
  | "completed"
  | "archived";

export type ProjectType = "game" | "website" | "tool" | "other";

export type Project = {
  id?: string;
  name: string;
  slug?: string;
  description?: string | null;
  // Optional logo/image to represent the project on the homepage
  logoUrl?: string | null;
  status?: ProjectStatus;
  type?: ProjectType;
  lastUpdatedAt?: string | null;
  createdAt?: string | null;
};
 