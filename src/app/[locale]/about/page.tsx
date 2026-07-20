import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Locale } from "@/types";
import { isLocale, getMessages, localizedAlternates } from "@/lib/i18n";
import { getProfile } from "@/lib/content/queries";
import { SocialLinks } from "@/components/about/SocialLinks";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const t = getMessages(locale);
  return { title: t.about.heading, alternates: { languages: localizedAlternates("/about") } };
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
  const profile = await getProfile(locale);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold sm:text-4xl">{t.about.heading}</h1>

      <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-[280px_1fr]">
        <div className="bg-bg-secondary relative aspect-[4/5] overflow-hidden">
          <Image
            src={profile.portrait.url}
            alt={profile.portrait.alt}
            fill
            sizes="280px"
            className="object-cover"
          />
        </div>

        <div>
          <p className="text-text-secondary text-lg leading-relaxed whitespace-pre-line">
            {profile.biography}
          </p>

          <div id="contact" className="border-border mt-12 border-t pt-8">
            <h2 className="text-xl font-semibold">{t.about.contactHeading}</h2>
            <div className="mt-6">
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
      </div>
    </div>
  );
}
