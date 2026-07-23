import Link from "next/link";
import type { Locale } from "@/types";
import { localePath } from "@/lib/i18n";
import { NavLinks } from "./NavLinks";
import { MobileMenu } from "./MobileMenu";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header({
  locale,
  brandName,
  navLabels,
  languageSwitcherLabel,
  menuLabels,
}: {
  locale: Locale;
  brandName: string;
  navLabels: { work: string; about: string };
  languageSwitcherLabel: string;
  menuLabels: { open: string; close: string };
}) {
  const links = [
    { href: localePath(locale, "/work"), label: navLabels.work },
    { href: localePath(locale, "/about"), label: navLabels.about },
  ];

  return (
    <header className="border-border bg-bg/90 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link
          href={localePath(locale, "/")}
          className="text-accent text-lg font-semibold tracking-widest uppercase"
        >
          {brandName}
        </Link>

        <div className="flex items-center gap-8">
          <NavLinks links={links} className="hidden items-center gap-8 md:flex" />
          <LanguageSwitcher locale={locale} label={languageSwitcherLabel} />
          <MobileMenu links={links} openLabel={menuLabels.open} closeLabel={menuLabels.close} />
        </div>
      </div>
    </header>
  );
}
