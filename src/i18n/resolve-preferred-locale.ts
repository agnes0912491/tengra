import { cookies, headers } from 'next/headers';
import config from '@/tl.config';

export async function resolvePreferredLocale() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value;
  return (locale && config.locales.includes(locale)) ? locale : config.defaultLocale;
}
