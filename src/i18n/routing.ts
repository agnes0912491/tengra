export const routing = {
  defaultLocale: "en",
  locales: [
    "en",
    "tr",
    "es",
    "fr",
    "de",
    "it",
    "pt",
    "ru",
    "ar",
    "zh",
    "ja",
    "ko",
  ],
} as const;

export type Locale = (typeof routing.locales)[number];

export function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}
