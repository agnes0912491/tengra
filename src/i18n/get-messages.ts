import en from "./messages/en.json";
import tr from "./messages/tr.json";
import es from "./messages/es.json";
import de from "./messages/de.json";
import fr from "./messages/fr.json";
import zh from "./messages/zh.json";
import ja from "./messages/ja.json";
import it from "./messages/it.json";
import pt from "./messages/pt.json";
import ru from "./messages/ru.json";
import ar from "./messages/ar.json";
import ko from "./messages/ko.json";
import { resolveLocale, type Locale, routing } from "./routing";

type Messages = typeof en;

// Base bundles available. Others will fall back to English.
const allMessages = {
  en,
  tr,
  es,
  de,
  fr,
  zh,
  ja,
  it,
  pt,
  ru,
  ar,
  ko,
} as const satisfies Record<string, Messages>;

export function getMessages(locale: string | undefined) {
  const chosen: Locale = resolveLocale(locale) ?? routing.defaultLocale;
  const fallback = allMessages[routing.defaultLocale];
  const messages =
    (allMessages as Record<string, Messages>)[chosen] ?? fallback;
  return { locale: chosen, messages };
}
