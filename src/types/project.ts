export type ProjectStatus =
  | "draft"
  | "in_progress"
  | "on_hold"
  | "completed"
  | "archived";

export type Project = {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  status?: ProjectStatus;
  lastUpdatedAt?: string | null;
  createdAt?: string | null;
};
