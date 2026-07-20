import type {
  AdjacentProjects,
  Locale,
  ProjectListItem,
  ProjectSummary,
  ResolvedProfile,
  ResolvedProject,
  ResolvedSiteSettings,
} from "@/types";
import { profile, projects, siteSettings } from "@/data/seed";
import { resolveLocalized } from "@/lib/i18n";

/**
 * Seed-backed implementation of the content contract (contracts/groq-queries.md),
 * reading from `src/data/seed.ts`. `queries.ts` routes to this when Sanity
 * isn't configured yet, and always in local dev/test unless Sanity env vars
 * are set — see `queries.ts` for the routing rule.
 */

function publishedProjectsByOrder() {
  return projects.filter((project) => project.published).sort((a, b) => a.order - b.order);
}

export async function getAllProjects(locale: Locale): Promise<ProjectListItem[]> {
  return publishedProjectsByOrder().map((project) => ({
    slug: project.slug,
    type: project.type,
    title: resolveLocalized(project.title, locale) ?? "",
    year: project.year,
    coverImage: project.coverImage,
    featured: project.featured,
  }));
}

export async function getProjectBySlug(
  slug: string,
  locale: Locale,
): Promise<ResolvedProject | null> {
  const project = projects.find((candidate) => candidate.slug === slug && candidate.published);
  if (!project) return null;

  return {
    slug: project.slug,
    type: project.type,
    title: resolveLocalized(project.title, locale) ?? "",
    year: project.year,
    location: project.location,
    role: resolveLocalized(project.role, locale) ?? "",
    producerDirector: resolveLocalized(project.producerDirector, locale),
    recognition: resolveLocalized(project.recognition, locale),
    description: resolveLocalized(project.description, locale) ?? "",
    coverImage: project.coverImage,
    youtubeUrl: project.youtubeUrl,
    previewClipUrl: project.previewClipUrl,
    gallery: project.gallery,
    order: project.order,
    featured: project.featured,
  };
}

export async function getAdjacentProjects(
  order: number,
  locale: Locale,
): Promise<AdjacentProjects> {
  const list = publishedProjectsByOrder();
  if (list.length <= 1) return { previous: null, next: null };

  const index = list.findIndex((project) => project.order === order);
  if (index === -1) return { previous: null, next: null };

  const toSummary = (project: (typeof list)[number]): ProjectSummary => ({
    slug: project.slug,
    title: resolveLocalized(project.title, locale) ?? "",
    coverImage: project.coverImage,
  });

  const previousIndex = (index - 1 + list.length) % list.length;
  const nextIndex = (index + 1) % list.length;

  return {
    previous: toSummary(list[previousIndex]),
    next: toSummary(list[nextIndex]),
  };
}

export async function getProfile(locale: Locale): Promise<ResolvedProfile> {
  return {
    name: profile.name,
    fullName: profile.fullName,
    tagline: resolveLocalized(profile.tagline, locale) ?? "",
    biography: resolveLocalized(profile.biography, locale) ?? "",
    portrait: profile.portrait,
    email: profile.email,
    instagramUrl: profile.instagramUrl,
    youtubeUrl: profile.youtubeUrl,
    linkedinUrl: profile.linkedinUrl,
    facebookUrl: profile.facebookUrl,
    aboutVideoUrl: profile.aboutVideoUrl,
  };
}

export async function getSiteSettings(locale: Locale): Promise<ResolvedSiteSettings> {
  return {
    showreelUrl: siteSettings.showreelUrl,
    contactCtaText: resolveLocalized(siteSettings.contactCtaText, locale) ?? "",
    seoTitle: resolveLocalized(siteSettings.seoTitle, locale),
    seoDescription: resolveLocalized(siteSettings.seoDescription, locale),
  };
}
