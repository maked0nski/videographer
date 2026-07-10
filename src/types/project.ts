import type { Localized } from "./locale";
import type { ImageAsset } from "./image";

export type ProjectType = "video" | "photo";

export interface Project {
  slug: string;
  type: ProjectType;
  title: Localized<string>;
  year: string;
  location?: string;
  role: Localized<string>;
  producerDirector?: Localized<string>;
  recognition?: Localized<string>;
  description: Localized<string>;
  coverImage: ImageAsset;
  /** Required when `type === "video"`; unused when `type === "photo"`. */
  youtubeUrl?: string;
  /** Behind-the-scenes set for video projects; primary gallery for photo projects. */
  gallery?: ImageAsset[];
  order: number;
  featured: boolean;
  published: boolean;
}

/** Minimal shape for list views and prev/next navigation — never the full entity. */
export interface ProjectSummary {
  slug: string;
  title: string;
  coverImage: ImageAsset;
}

/** List-view shape used by the Work page and homepage previews. */
export interface ProjectListItem {
  slug: string;
  type: ProjectType;
  title: string;
  year: string;
  coverImage: ImageAsset;
  featured: boolean;
}

export interface AdjacentProjects {
  previous: ProjectSummary | null;
  next: ProjectSummary | null;
}

/** Full detail-page shape, locale-resolved — every `Localized<string>` field
 * has already been reduced to a plain string (falling back per FR-021). */
export interface ResolvedProject {
  slug: string;
  type: ProjectType;
  title: string;
  year: string;
  location?: string;
  role: string;
  producerDirector?: string;
  recognition?: string;
  description: string;
  coverImage: ImageAsset;
  youtubeUrl?: string;
  gallery?: ImageAsset[];
  order: number;
  featured: boolean;
}
