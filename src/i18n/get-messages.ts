import en from "./messages/en.json";
import tr from "./messages/tr.json"; 
import { resolveLocale, type Locale, routing } from "./routing";

type Messages = typeof en;

// Base bundles available. Others will fall back to English.
const allMessages = {
  en,
  tr, 
} as const satisfies Record<string, Messages>;

export function getMessages(locale: string | undefined) {
  const chosen: Locale = resolveLocale(locale) ?? routing.defaultLocale;
  const fallback = allMessages[routing.defaultLocale];
  const messages =
    (allMessages as Record<string, Messages>)[chosen] ?? fallback;
  return { locale: chosen, messages };
}
