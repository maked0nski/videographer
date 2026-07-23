/**
 * The only place `src/app` reads content from. Delegates to the Sanity-backed
 * implementation (`src/lib/sanity/queries.ts`) — no page or component ever
 * imports it directly.
 */
export {
  getAllProjects,
  getProjectBySlug,
  getAdjacentProjects,
  getProfile,
  getSiteSettings,
} from "@/lib/sanity/queries";
