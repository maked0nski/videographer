import Link from "next/link";
import type { Locale } from "@/types";
import { localePath, getMessages } from "@/lib/i18n";

export function Footer({ locale, brandName }: { locale: Locale; brandName: string }) {
  const t = getMessages(locale);
  const year = new Date().getFullYear();

  return (
    <footer className="border-border border-t">
      <div className="text-text-secondary mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          {brandName} — © {year}. {t.footer.rights}
        </p>
        <nav className="flex gap-6">
          <Link href={localePath(locale, "/")} className="hover:text-accent transition-colors">
            {t.nav.home}
          </Link>
          <Link href={localePath(locale, "/work")} className="hover:text-accent transition-colors">
            {t.nav.work}
          </Link>
          <Link href={localePath(locale, "/about")} className="hover:text-accent transition-colors">
            {t.nav.about}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
