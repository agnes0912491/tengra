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
  raw: string | object | null | undefined,
  locale: string
): string | undefined => {
  if (!raw) return undefined;

  let obj: unknown = raw;

  if (typeof raw === "string") {
    try {
      obj = JSON.parse(raw);
    } catch {
      // not JSON, return as is
      return raw;
    }
  }

  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    const rec = obj as Record<string, unknown>;
    const direct = rec[locale];
    if (typeof direct === "string" && direct.trim().length > 0) {
      return direct;
    }
    // Fallback to any string value
    for (const key of Object.keys(rec)) {
      const value = rec[key];
      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }
    }
    return undefined;
  }

  // If it was a string that failed to parse as object, we already returned it above.
  // If it was an object but failed checks, return undefined.
  if (typeof raw === "string") return raw;
  return undefined;
};
