import type {
  AdjacentProjects,
  Locale,
  ProjectListItem,
  ResolvedProfile,
  ResolvedProject,
  ResolvedSiteSettings,
} from "@/types";
import * as seedQueries from "./seed-queries";

/**
 * The only place `src/app` reads content from (contracts/groq-queries.md).
 *
 * Routes to the Sanity-backed implementation (`src/lib/sanity/queries.ts`,
 * tasks.md T051/T052) once `NEXT_PUBLIC_SANITY_PROJECT_ID` is configured;
 * otherwise falls back to the seed-backed implementation
 * (`src/lib/content/seed-queries.ts`, `src/data/seed.ts`). Both sides
 * implement the exact same exported signatures, so no page or component
 * ever imports either implementation directly or knows which one is active
 * (constitution Principle I) — this file is the one place that would change
 * if the CMS were ever swapped again.
 */
const isSanityConfigured = Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);

async function loadImpl() {
  if (!isSanityConfigured) return seedQueries;
  return import("@/lib/sanity/queries");
}

export async function getAllProjects(locale: Locale): Promise<ProjectListItem[]> {
  return (await loadImpl()).getAllProjects(locale);
}

export async function getProjectBySlug(
  slug: string,
  locale: Locale,
): Promise<ResolvedProject | null> {
  return (await loadImpl()).getProjectBySlug(slug, locale);
}

export async function getAdjacentProjects(
  order: number,
  locale: Locale,
): Promise<AdjacentProjects> {
  return (await loadImpl()).getAdjacentProjects(order, locale);
}

export async function getProfile(locale: Locale): Promise<ResolvedProfile> {
  return (await loadImpl()).getProfile(locale);
}

export async function getSiteSettings(locale: Locale): Promise<ResolvedSiteSettings> {
  return (await loadImpl()).getSiteSettings(locale);
}
