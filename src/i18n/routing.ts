export const routing = {
  defaultLocale: "en",
  locales: ["en", "tr"],
} as const;

export type Locale = (typeof routing.locales)[number];

export function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}
