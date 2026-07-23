"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LOCALES, type Locale } from "@/types";
import { switchLocaleInPath } from "@/lib/i18n";
import { cn } from "@/lib/cn";

/**
 * Computes the equivalent path in the other locale from the current pathname
 * and swaps to it, preserving the current project slug.
 */
export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={label}
      data-testid="language-switcher"
      className="flex items-center gap-1 text-sm tracking-wide uppercase"
    >
      {LOCALES.map((candidate, index) => (
        <span key={candidate} className="flex items-center gap-1">
          {index > 0 && <span className="text-text-secondary">/</span>}
          <Link
            href={switchLocaleInPath(pathname, candidate)}
            aria-current={candidate === locale ? "true" : undefined}
            className={cn(
              "hover:text-accent transition-colors",
              candidate === locale ? "text-accent" : "text-text-secondary",
            )}
          >
            {candidate}
          </Link>
        </span>
      ))}
    </nav>
  );
}
