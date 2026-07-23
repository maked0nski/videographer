import type { Locale } from "@/types";
import { DEFAULT_LOCALE, LOCALES } from "@/types";

/** Prefixes a locale-relative path (e.g. "/work/my-slug") with the locale segment. */
export function localePath(locale: Locale, path: string = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

/**
 * Computes the equivalent path in another locale by swapping the leading
 * locale segment, preserving everything after it (project slug, etc.).
 */
export function switchLocaleInPath(pathname: string, targetLocale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  const [maybeLocale, ...rest] = segments;
  const isLocaleSegment = (LOCALES as readonly string[]).includes(maybeLocale ?? "");
  const restPath = isLocaleSegment ? rest : segments;
  return localePath(targetLocale, restPath.length ? `/${restPath.join("/")}` : "/");
}

/**
 * Builds the `hreflang` alternate-locale map for a locale-relative path
 * (e.g. "/work/my-slug") — used by every page's `generateMetadata` so search
 * engines see the correct uk/en pair per page, not just per site.
 */
export function localizedAlternates(path: string = "/"): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of LOCALES) {
    alternates[locale] = localePath(locale, path);
  }
  alternates["x-default"] = localePath(DEFAULT_LOCALE, path);
  return alternates;
}
