import en from "./messages/en.json";
import tr from "./messages/tr.json";
import { isLocale, type Locale, routing } from "./routing";

type Messages = typeof en;

const allMessages: Record<Locale, Messages> = {
  en,
  tr,
};

export function getMessages(locale: string | undefined) {
  const normalizedLocale = isLocale(locale ?? "") ? (locale as Locale) : routing.defaultLocale;
  return { locale: normalizedLocale, messages: allMessages[normalizedLocale] };
}
