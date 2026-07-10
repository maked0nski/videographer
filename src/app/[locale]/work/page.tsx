import { notFound } from "next/navigation";
import type { Locale } from "@/types";
import { isLocale, getMessages, localizedAlternates } from "@/lib/i18n";
import { getAllProjects } from "@/lib/content/queries";
import { WorkFilter } from "@/components/portfolio/WorkFilter";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const t = getMessages(locale);
  return { title: t.work.heading, alternates: { languages: localizedAlternates("/work") } };
}

export default async function WorkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;

  const t = getMessages(locale);
  const projects = await getAllProjects(locale);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-semibold sm:text-4xl">{t.work.heading}</h1>
      <div className="mt-10">
        <WorkFilter
          projects={projects}
          locale={locale}
          labels={{
            all: t.work.filterAll,
            films: t.work.filterFilms,
            photography: t.work.filterPhotography,
          }}
        />
      </div>
    </div>
  );
}
