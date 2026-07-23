import { notFound } from "next/navigation";
import type { Locale } from "@/types";
import { isLocale, localizedAlternates } from "@/lib/i18n";
import { getAllProjects, getSiteSettings } from "@/lib/content/queries";
import { WorkFilter } from "@/components/portfolio/WorkFilter";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const siteSettings = await getSiteSettings(locale);
  return {
    title: siteSettings.workPageHeading,
    alternates: { languages: localizedAlternates("/work") },
  };
}

export default async function WorkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;

  const [siteSettings, projects] = await Promise.all([
    getSiteSettings(locale),
    getAllProjects(locale),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-semibold sm:text-4xl">{siteSettings.workPageHeading}</h1>
      <div className="mt-10">
        <WorkFilter
          projects={projects}
          locale={locale}
          labels={{
            all: siteSettings.filterAllLabel,
            films: siteSettings.filterFilmsLabel,
            photography: siteSettings.filterPhotographyLabel,
          }}
        />
      </div>
    </div>
  );
}
