import { loadTranslations } from '@tengra/language/server';
import config from '@/tl.config';
import { resolvePreferredLocale } from './resolve-preferred-locale';

export async function getMessages(locale?: string) {
  const targetLocale = locale || await resolvePreferredLocale();
  return loadTranslations(config, targetLocale);
}
