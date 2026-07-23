import { LOCALES, type Locale, type Localized } from "@/types";

/**
 * Resolves a localized field for the requested locale, falling back to
 * whichever other locale is populated (FR-021) instead of rendering nothing.
 */
export function resolveLocalized<T>(
  value: Localized<T> | undefined,
  locale: Locale,
): T | undefined {
  if (!value) return undefined;
  if (value[locale] !== undefined) return value[locale];
  const fallbackLocale = LOCALES.find((candidate) => candidate !== locale);
  return fallbackLocale ? value[fallbackLocale] : undefined;
}
