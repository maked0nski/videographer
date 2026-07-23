import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/types";

export { DEFAULT_LOCALE, LOCALES };
export type { Locale };

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
