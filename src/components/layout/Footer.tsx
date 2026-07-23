import Link from "next/link";
import type { Locale } from "@/types";
import { localePath } from "@/lib/i18n";

export function Footer({
  locale,
  brandName,
  rightsText,
  navLabels,
}: {
  locale: Locale;
  brandName: string;
  rightsText: string;
  navLabels: { home: string; work: string; about: string };
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border border-t">
      <div className="text-text-secondary mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 text-center text-sm sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p>
          {brandName} — © {year}. {rightsText}
        </p>
        <nav className="flex gap-6">
          <Link href={localePath(locale, "/")} className="hover:text-accent transition-colors">
            {navLabels.home}
          </Link>
          <Link href={localePath(locale, "/work")} className="hover:text-accent transition-colors">
            {navLabels.work}
          </Link>
          <Link href={localePath(locale, "/about")} className="hover:text-accent transition-colors">
            {navLabels.about}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
