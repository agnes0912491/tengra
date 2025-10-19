export const dynamic = "force-dynamic";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { resolveLocale, routing } from "@/i18n/routing";

function selectPreferredLocale() {
  const cookieLocale = cookies().get("NEXT_LOCALE")?.value;
  const headerLocale = headers().get("accept-language") ?? "";

  let match = resolveLocale(cookieLocale);

  if (!match) {
    const candidates = headerLocale
      .split(",")
      .map((part) => part.trim().split(";")[0])
      .map((code) => code.toLowerCase().replace("_", "-"));

    for (const code of candidates) {
      const exact = (routing.locales as readonly string[]).find(
        (locale) => locale.toLowerCase() === code
      );

      match =
        (exact as (typeof routing.locales)[number] | undefined) ??
        resolveLocale(code);

      if (match) {
        break;
      }
    }
  }

  return match ?? routing.defaultLocale;
}

export default function IndexPage() {
  const locale = selectPreferredLocale();
  redirect(`/${locale}`);
}
