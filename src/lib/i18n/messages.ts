import type { Locale } from "@/types";
import en from "@/messages/en.json";
import uk from "@/messages/uk.json";

export type Messages = typeof en;

const dictionaries: Record<Locale, Messages> = { en, uk };

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale];
}
