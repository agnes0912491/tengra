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
  /**
   * Optional localized descriptions stored as a JSON object
   * in the backend (e.g. { "tr": "...", "en": "..." }).
   * The plain `description` field is used as a fallback.
   */
  descriptionsByLocale?: Record<string, string> | null;
  // Optional logo/image to represent the project on the homepage
  logoUrl?: string | null;
  status?: ProjectStatus;
  type?: ProjectType;
  lastUpdatedAt?: string | null;
  createdAt?: string | null;
};
 
