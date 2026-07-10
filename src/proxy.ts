import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, type Locale } from "@/types";

/**
 * Picks `uk` when Ukrainian is the visitor's best-matching Accept-Language
 * preference, otherwise falls back to `en` — covers a missing header, no
 * overlap with uk/en, or a malformed header (research.md §3).
 */
function detectLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const preferences = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, qValue] = part.trim().split(";q=");
      const quality = qValue ? Number.parseFloat(qValue) : 1;
      return { tag: tag.trim().toLowerCase(), quality: Number.isNaN(quality) ? 1 : quality };
    })
    .sort((a, b) => b.quality - a.quality);

  const best = preferences.find((preference) => preference.tag.startsWith("uk"));
  return best ? "uk" : DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const locale = detectLocale(request.headers.get("accept-language"));
  return NextResponse.redirect(new URL(`/${locale}`, request.url));
}

export const config = {
  matcher: "/",
};
