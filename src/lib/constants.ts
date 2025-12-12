export const CDN_BASE_URL =
  (process.env.NEXT_PUBLIC_CDN_BASE_URL || "").replace(/\/+$/, "") ||
  "https://cdn.tengra.studio";

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

export const getLocalizedText = (
  raw: string | null | undefined,
  locale: string
): string | undefined => {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const rec = parsed as Record<string, unknown>;
      const direct = rec[locale];
      if (typeof direct === "string" && direct.trim().length > 0) {
        return direct;
      }
      for (const key of Object.keys(rec)) {
        const value = rec[key];
        if (typeof value === "string" && value.trim().length > 0) {
          return value;
        }
      }
      return undefined;
    }
  } catch {
    // not JSON, fall through to raw
  }
  return raw;
};
