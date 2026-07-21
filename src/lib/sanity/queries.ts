import type {
  AdjacentProjects,
  Locale,
  Localized,
  ProjectListItem,
  ProjectSummary,
  ProjectType,
  ResolvedProfile,
  ResolvedProject,
  ResolvedSiteSettings,
} from "@/types";
import { resolveLocalized } from "@/lib/i18n";
import { sanityClient } from "./client";
import { toImageAsset } from "./image";

/**
 * GROQ implementations matching `contracts/groq-queries.md` — same exported
 * signatures as `src/lib/content/queries.ts` (seed-backed), so that module
 * can swap to calling these with no component changes (tasks.md T052).
 */

type SanityImageRef = Parameters<typeof toImageAsset>[0];

interface SanityProjectDoc {
  slug: string;
  type: ProjectType;
  title: Localized<string>;
  year: string;
  location?: string;
  role: Localized<string>;
  producerDirector?: Localized<string>;
  recognition?: Localized<string>;
  description: Localized<string>;
  coverImage: SanityImageRef;
  youtubeUrl?: string;
  previewClipUrl?: string;
  gallery?: SanityImageRef[];
  order: number;
  featured: boolean;
}

interface SanityProfileDoc {
  name: string;
  fullName: string;
  tagline: Localized<string>;
  biography: Localized<string>;
  portrait: SanityImageRef;
  email: string;
  instagramUrl: string;
  youtubeUrl: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  aboutVideoUrl?: string;
}

interface SanitySiteSettingsDoc {
  showreelUrl: string;
  contactCtaText?: Localized<string>;
  seoTitle?: Localized<string>;
  seoDescription?: Localized<string>;
  navHomeLabel?: Localized<string>;
  navWorkLabel?: Localized<string>;
  navAboutLabel?: Localized<string>;
  footerRightsText?: Localized<string>;
  watchShowreelLabel?: Localized<string>;
  selectedWorkHeading?: Localized<string>;
  viewAllWorkLabel?: Localized<string>;
  photographyHeading?: Localized<string>;
  viewPhotographyLabel?: Localized<string>;
  contactCtaButtonLabel?: Localized<string>;
  workPageHeading?: Localized<string>;
  filterAllLabel?: Localized<string>;
  filterFilmsLabel?: Localized<string>;
  filterPhotographyLabel?: Localized<string>;
  behindTheScenesHeading?: Localized<string>;
  previousProjectLabel?: Localized<string>;
  nextProjectLabel?: Localized<string>;
  yearFieldLabel?: Localized<string>;
  locationFieldLabel?: Localized<string>;
  roleFieldLabel?: Localized<string>;
  producerDirectorFieldLabel?: Localized<string>;
  recognitionFieldLabel?: Localized<string>;
  aboutPageHeading?: Localized<string>;
  aboutContactHeading?: Localized<string>;
}

const PROJECT_LIST_PROJECTION = `{
  "slug": slug.current,
  type,
  title,
  year,
  coverImage{..., asset->{_id, metadata{dimensions}}},
  featured
}`;

const PROJECT_FULL_PROJECTION = `{
  "slug": slug.current,
  type,
  title,
  year,
  location,
  role,
  producerDirector,
  recognition,
  description,
  coverImage{..., asset->{_id, metadata{dimensions}}},
  youtubeUrl,
  "previewClipUrl": previewClip.asset->url,
  gallery,
  order,
  featured
}`;

export async function getAllProjects(locale: Locale): Promise<ProjectListItem[]> {
  const docs = await sanityClient.fetch<SanityProjectDoc[]>(
    `*[_type == "project" && published == true] | order(order asc) ${PROJECT_LIST_PROJECTION}`,
  );

  return docs.map((doc) => ({
    slug: doc.slug,
    type: doc.type,
    title: resolveLocalized(doc.title, locale) ?? "",
    year: doc.year,
    coverImage: toImageAsset(doc.coverImage),
    featured: doc.featured,
  }));
}

export async function getProjectBySlug(
  slug: string,
  locale: Locale,
): Promise<ResolvedProject | null> {
  const doc = await sanityClient.fetch<SanityProjectDoc | null>(
    `*[_type == "project" && published == true && slug.current == $slug][0] ${PROJECT_FULL_PROJECTION}`,
    { slug },
  );
  if (!doc) return null;

  return {
    slug: doc.slug,
    type: doc.type,
    title: resolveLocalized(doc.title, locale) ?? "",
    year: doc.year,
    location: doc.location,
    role: resolveLocalized(doc.role, locale) ?? "",
    producerDirector: resolveLocalized(doc.producerDirector, locale),
    recognition: resolveLocalized(doc.recognition, locale),
    description: resolveLocalized(doc.description, locale) ?? "",
    coverImage: toImageAsset(doc.coverImage),
    youtubeUrl: doc.youtubeUrl,
    previewClipUrl: doc.previewClipUrl,
    gallery: doc.gallery?.map((image) => toImageAsset(image)),
    order: doc.order,
    featured: doc.featured,
  };
}

/**
 * Wraps around for 2+ published projects; returns `{ previous: null, next:
 * null }` for exactly one (data-model.md, contracts/groq-queries.md) — same
 * rule as the seed-backed implementation, computed here from the ordered
 * slug/title/coverImage list rather than a stored relationship.
 */
export async function getAdjacentProjects(
  order: number,
  locale: Locale,
): Promise<AdjacentProjects> {
  const docs = await sanityClient.fetch<
    Pick<SanityProjectDoc, "slug" | "title" | "coverImage" | "order">[]
  >(
    `*[_type == "project" && published == true] | order(order asc) { "slug": slug.current, title, coverImage{..., asset->{_id, metadata{dimensions}}}, order }`,
  );

  if (docs.length <= 1) return { previous: null, next: null };

  const index = docs.findIndex((doc) => doc.order === order);
  if (index === -1) return { previous: null, next: null };

  const toSummary = (doc: (typeof docs)[number]): ProjectSummary => ({
    slug: doc.slug,
    title: resolveLocalized(doc.title, locale) ?? "",
    coverImage: toImageAsset(doc.coverImage),
  });

  const previousIndex = (index - 1 + docs.length) % docs.length;
  const nextIndex = (index + 1) % docs.length;

  return {
    previous: toSummary(docs[previousIndex]),
    next: toSummary(docs[nextIndex]),
  };
}

export async function getProfile(locale: Locale): Promise<ResolvedProfile> {
  // `asset->` dereference is required to get real width/height — a bare
  // image field only returns {_ref, _type} (see queries.ts PROJECT_*_PROJECTION).
  const doc = await sanityClient.fetch<SanityProfileDoc>(
    `*[_id == "profile"][0]{..., portrait{..., asset->{_id, metadata{dimensions}}}}`,
  );

  return {
    name: doc.name,
    fullName: doc.fullName,
    tagline: resolveLocalized(doc.tagline, locale) ?? "",
    biography: resolveLocalized(doc.biography, locale) ?? "",
    portrait: toImageAsset(doc.portrait, doc.fullName),
    email: doc.email,
    instagramUrl: doc.instagramUrl,
    youtubeUrl: doc.youtubeUrl,
    linkedinUrl: doc.linkedinUrl,
    facebookUrl: doc.facebookUrl,
    aboutVideoUrl: doc.aboutVideoUrl,
  };
}

export async function getSiteSettings(locale: Locale): Promise<ResolvedSiteSettings> {
  const doc = await sanityClient.fetch<SanitySiteSettingsDoc>(`*[_id == "siteSettings"][0]`);

  return {
    showreelUrl: doc.showreelUrl,
    contactCtaText: resolveLocalized(doc.contactCtaText, locale) ?? "",
    seoTitle: resolveLocalized(doc.seoTitle, locale),
    seoDescription: resolveLocalized(doc.seoDescription, locale),
    navHomeLabel: resolveLocalized(doc.navHomeLabel, locale) ?? "",
    navWorkLabel: resolveLocalized(doc.navWorkLabel, locale) ?? "",
    navAboutLabel: resolveLocalized(doc.navAboutLabel, locale) ?? "",
    footerRightsText: resolveLocalized(doc.footerRightsText, locale) ?? "",
    watchShowreelLabel: resolveLocalized(doc.watchShowreelLabel, locale) ?? "",
    selectedWorkHeading: resolveLocalized(doc.selectedWorkHeading, locale) ?? "",
    viewAllWorkLabel: resolveLocalized(doc.viewAllWorkLabel, locale) ?? "",
    photographyHeading: resolveLocalized(doc.photographyHeading, locale) ?? "",
    viewPhotographyLabel: resolveLocalized(doc.viewPhotographyLabel, locale) ?? "",
    contactCtaButtonLabel: resolveLocalized(doc.contactCtaButtonLabel, locale) ?? "",
    workPageHeading: resolveLocalized(doc.workPageHeading, locale) ?? "",
    filterAllLabel: resolveLocalized(doc.filterAllLabel, locale) ?? "",
    filterFilmsLabel: resolveLocalized(doc.filterFilmsLabel, locale) ?? "",
    filterPhotographyLabel: resolveLocalized(doc.filterPhotographyLabel, locale) ?? "",
    behindTheScenesHeading: resolveLocalized(doc.behindTheScenesHeading, locale) ?? "",
    previousProjectLabel: resolveLocalized(doc.previousProjectLabel, locale) ?? "",
    nextProjectLabel: resolveLocalized(doc.nextProjectLabel, locale) ?? "",
    yearFieldLabel: resolveLocalized(doc.yearFieldLabel, locale) ?? "",
    locationFieldLabel: resolveLocalized(doc.locationFieldLabel, locale) ?? "",
    roleFieldLabel: resolveLocalized(doc.roleFieldLabel, locale) ?? "",
    producerDirectorFieldLabel: resolveLocalized(doc.producerDirectorFieldLabel, locale) ?? "",
    recognitionFieldLabel: resolveLocalized(doc.recognitionFieldLabel, locale) ?? "",
    aboutPageHeading: resolveLocalized(doc.aboutPageHeading, locale) ?? "",
    aboutContactHeading: resolveLocalized(doc.aboutContactHeading, locale) ?? "",
  };
}
