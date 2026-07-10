import Link from "next/link";
import type { Locale } from "@/types";
import { localePath } from "@/lib/i18n";
import { getMessages } from "@/lib/i18n";
import { NavLinks } from "./NavLinks";
import { MobileMenu } from "./MobileMenu";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header({ locale, brandName }: { locale: Locale; brandName: string }) {
  const t = getMessages(locale);

  const links = [
    { href: localePath(locale, "/work"), label: t.nav.work },
    { href: localePath(locale, "/about"), label: t.nav.about },
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
          <LanguageSwitcher locale={locale} label={t.common.languageSwitcher} />
          <MobileMenu links={links} openLabel={t.nav.menu} closeLabel={t.nav.close} />
        </div>
      </div>
    </header>
  );
}
