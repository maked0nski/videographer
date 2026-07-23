export type Locale = "uk" | "en";

export const LOCALES: readonly Locale[] = ["uk", "en"];

export const DEFAULT_LOCALE: Locale = "en";

/**
 * A single missing translation must degrade gracefully rather than break a
 * page, so neither key is required at the type level — callers resolve with
 * a fallback via `resolveLocalized`.
 */
export type Localized<T> = Partial<Record<Locale, T>>;
