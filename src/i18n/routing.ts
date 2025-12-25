import config from '@/tl.config';

export const routing = {
  locales: config.locales,
  defaultLocale: config.defaultLocale
};

export type Locale = (typeof routing.locales)[number];

export function resolveLocale(locale: string) {
  return config.locales.includes(locale) ? locale : config.defaultLocale;
}
