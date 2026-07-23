import type { Locale } from "@/types";
import { isLocale, localePath, getMessages } from "@/lib/i18n";
import { getAllProjects, getProfile, getSiteSettings } from "@/lib/content/queries";
import { notFound } from "next/navigation";
import { HeroVideo } from "@/components/home/HeroVideo";
import { ShowreelButton } from "@/components/home/ShowreelButton";
import { PhotographyPreview } from "@/components/home/PhotographyPreview";
import { ContactCta } from "@/components/home/ContactCta";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { ButtonLink } from "@/components/ui/Button";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;

  const t = getMessages(locale);
  const [profile, siteSettings, allProjects] = await Promise.all([
    getProfile(locale),
    getSiteSettings(locale),
    getAllProjects(locale),
  ]);

  const selectedWork = allProjects.filter((project) => project.featured).slice(0, 6);

  return (
    <div>
      <section className="relative flex h-[100svh] min-h-[560px] items-end overflow-hidden">
        <HeroVideo />
        <div className="from-bg via-bg/40 absolute inset-0 bg-gradient-to-t to-transparent" />
        <div className="relative mx-auto w-full max-w-6xl px-6 pb-20">
          <h1 className="text-accent text-5xl font-bold tracking-widest uppercase sm:text-7xl">
            {profile.name}
          </h1>
          <p className="text-text mt-4 max-w-xl text-lg sm:text-xl">{profile.tagline}</p>
          <div className="mt-8">
            <ShowreelButton
              showreelUrl={siteSettings.showreelUrl}
              label={siteSettings.watchShowreelLabel}
              closeLabel={t.video.closeModal}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">{siteSettings.selectedWorkHeading}</h2>
          <ButtonLink href={localePath(locale, "/work")} variant="ghost">
            {siteSettings.viewAllWorkLabel}
          </ButtonLink>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {selectedWork.map((project) => (
            <ProjectCard key={project.slug} project={project} locale={locale} />
          ))}
        </div>
      </section>

      <PhotographyPreview
        projects={allProjects}
        locale={locale}
        heading={siteSettings.photographyHeading}
        cta={siteSettings.viewPhotographyLabel}
      />

      <ContactCta
        locale={locale}
        heading={siteSettings.contactCtaText}
        cta={siteSettings.contactCtaButtonLabel}
      />
    </div>
  );
}
