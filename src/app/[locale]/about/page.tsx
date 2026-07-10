import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Locale } from "@/types";
import { isLocale, getMessages, localizedAlternates } from "@/lib/i18n";
import { getProfile } from "@/lib/content/queries";

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
 * Biography, portrait, and direct contact links (email, Instagram, YouTube)
 * — no on-site contact form anywhere (FR-016, FR-017).
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
            <ul className="mt-6 flex flex-col gap-4 text-sm">
              <li>
                <a href={`mailto:${profile.email}`} className="hover:text-accent transition-colors">
                  {t.about.email}: {profile.email}
                </a>
              </li>
              <li>
                <a
                  href={profile.instagramUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-accent transition-colors"
                >
                  {t.about.instagram}
                </a>
              </li>
              <li>
                <a
                  href={profile.youtubeUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-accent transition-colors"
                >
                  {t.about.youtube}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
