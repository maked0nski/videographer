import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Locale } from "@/types";
import { isLocale, getMessages, localizedAlternates } from "@/lib/i18n";
import { getProfile, getSiteSettings } from "@/lib/content/queries";
import { SocialLinks } from "@/components/about/SocialLinks";
import { HeroVideoPlayer } from "@/components/media/HeroVideoPlayer";

/**
 * Falls back to a fresh render at most once an hour even if a Sanity
 * webhook-triggered on-demand revalidation is ever missed (e.g. right after
 * a container recreate wipes the on-disk route cache before a new publish
 * re-primes it) — a time-based safety net alongside on-demand revalidation.
 */
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const siteSettings = await getSiteSettings(locale);
  return {
    title: siteSettings.aboutPageHeading,
    alternates: { languages: localizedAlternates("/about") },
  };
}

/**
 * Biography, portrait, and direct contact links (email, Instagram, YouTube,
 * LinkedIn, Facebook) — no on-site contact form anywhere (FR-016, FR-017).
 */
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;

  const t = getMessages(locale);
  const [profile, siteSettings] = await Promise.all([getProfile(locale), getSiteSettings(locale)]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-semibold sm:text-4xl">{siteSettings.aboutPageHeading}</h1>

      <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-[480px_1fr]">
        <div className="bg-bg-secondary relative aspect-[4/5] overflow-hidden">
          <Image
            src={profile.portrait.url}
            alt={profile.portrait.alt}
            fill
            sizes="(min-width: 640px) 480px, 100vw"
            className="object-cover"
          />
        </div>

        <p className="text-text-secondary text-lg leading-relaxed whitespace-pre-line">
          {profile.biography}
        </p>
      </div>

      {profile.aboutVideoUrl && (
        <div className="mt-12">
          <HeroVideoPlayer
            youtubeUrl={profile.aboutVideoUrl}
            coverImage={profile.portrait}
            playLabel={t.project.playVideo}
          />
        </div>
      )}

      <div id="contact" className="border-border mt-12 border-t pt-8 text-center sm:text-left">
        <h2 className="text-xl font-semibold">{siteSettings.aboutContactHeading}</h2>
        <div className="mt-6 flex justify-center sm:justify-start">
          <SocialLinks
            profile={profile}
            labels={{
              email: t.about.email,
              instagram: t.about.instagram,
              youtube: t.about.youtube,
              linkedin: t.about.linkedin,
              facebook: t.about.facebook,
            }}
          />
        </div>
      </div>
    </div>
  );
}
