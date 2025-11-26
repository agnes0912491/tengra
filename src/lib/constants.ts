export const CDN_BASE_URL =
  (process.env.NEXT_PUBLIC_CDN_BASE_URL || "").replace(/\/+$/, "") ||
  (process.env.NEXT_PUBLIC_BACKEND_API_URL || "").replace(/\/+$/, "");

export const resolveCdnUrl = (path: string | null | undefined): string => {
  if (!path) return "";
  // Absolute URLs or data URLs are passed through
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) {
    return path;
  }
  const base = CDN_BASE_URL;
  if (!base) {
    return path;
  }
  if (path.startsWith("/")) {
    return `${base}${path}`;
  }
  return `${base}/${path}`;
};
