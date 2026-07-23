import type { Localized } from "./locale";
import type { ImageAsset } from "./image";
import type { StillItem } from "./gallery";

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
  /** Muted looping preview shown before Play is clicked; video projects only. */
  previewClipUrl?: string;
  /** Color-graded highlight stills; video projects only. */
  filmStills?: ImageAsset[];
  /** Mixed photos/looping clips documenting the shoot; video projects only. */
  behindTheScenes?: StillItem[];
  /** Primary gallery; photo projects only. */
  photoGallery?: ImageAsset[];
  camera?: string;
  lenses?: string;
  /** Sortable rank string (LexoRank), not a display number — orders ascending as a plain string compare. */
  order: string;
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
 * has already been reduced to a plain string (falling back via `resolveLocalized`). */
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
  previewClipUrl?: string;
  filmStills?: ImageAsset[];
  behindTheScenes?: StillItem[];
  photoGallery?: ImageAsset[];
  camera?: string;
  lenses?: string;
  order: string;
  featured: boolean;
}
