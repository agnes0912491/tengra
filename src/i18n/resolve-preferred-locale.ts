import { resolveLocale, routing, type Locale } from "./routing";

type LocaleSource = "cookie" | "header" | "default";

type ResolvePreferredLocaleOptions = {
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
};

type ResolvePreferredLocaleResult = {
  locale: Locale;
  source: LocaleSource;
};

export function resolvePreferredLocale({
  cookieLocale,
  acceptLanguage,
}: ResolvePreferredLocaleOptions): ResolvePreferredLocaleResult {
  const resolvedFromCookie = resolveLocale(cookieLocale ?? undefined);
  if (resolvedFromCookie) {
    return { locale: resolvedFromCookie, source: "cookie" };
  }

  const headerValue = acceptLanguage ?? "";
  const candidates = headerValue
    .split(",")
    .map((entry) => entry.trim().split(";")[0])
    .filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    const resolved = resolveLocale(candidate);
    if (resolved) {
      return { locale: resolved, source: "header" };
    }
  }

  return { locale: routing.defaultLocale, source: "default" };
}
