import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import "@/styles/globals.css";
import { LOCALES, type Locale } from "@/types";
import { getMessages, isLocale, localizedAlternates } from "@/lib/i18n";
import { getProfile, getSiteSettings } from "@/lib/content/queries";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SetHtmlLang } from "@/components/layout/SetHtmlLang";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const [profile, siteSettings] = await Promise.all([getProfile(locale), getSiteSettings(locale)]);

  const title = siteSettings.seoTitle ?? `${profile.name} — ${profile.tagline}`;
  const description = siteSettings.seoDescription ?? profile.tagline;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s — ${profile.name}` },
    description,
    alternates: {
      languages: localizedAlternates("/"),
    },
    openGraph: {
      title,
      description,
      images: ["/og-default.jpg"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;

  const [profile, siteSettings] = await Promise.all([getProfile(locale), getSiteSettings(locale)]);
  const t = getMessages(locale);

  return (
    <div className="bg-bg text-text flex min-h-screen flex-col antialiased">
      <SetHtmlLang locale={locale} />
      <a
        href="#main-content"
        className="bg-accent text-bg fixed top-0 left-0 z-50 -translate-y-full px-4 py-2 focus:translate-y-0"
      >
        {t.common.skipToContent}
      </a>
      <Header
        locale={locale}
        brandName={profile.name}
        navLabels={{
          work: siteSettings.navWorkLabel,
          about: siteSettings.navAboutLabel,
        }}
        languageSwitcherLabel={t.common.languageSwitcher}
        menuLabels={{ open: t.nav.menu, close: t.nav.close }}
      />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer
        locale={locale}
        brandName={profile.name}
        rightsText={siteSettings.footerRightsText}
        navLabels={{
          home: siteSettings.navHomeLabel,
          work: siteSettings.navWorkLabel,
          about: siteSettings.navAboutLabel,
        }}
      />
      <Analytics />
    </div>
  );
}
