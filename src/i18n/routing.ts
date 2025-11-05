export const routing = {
  defaultLocale: "en",
  locales: ["en", "tr"],
} as const;

export type Locale = (typeof routing.locales)[number];

export function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

export function resolveLocale(value: string | null | undefined): Locale | null {
  if (!value) return null;

  const normalized = value.toLowerCase().replace("_", "-");
  const candidates = [normalized, normalized.split("-")[0]];

  for (const candidate of candidates) {
    if (isLocale(candidate)) {
      return candidate;
    }
  }

  return null;
}
