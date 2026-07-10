import type { Localized } from "./locale";
import type { ImageAsset } from "./image";

/** Singleton document — the site owner's public identity and contact details. */
export interface Profile {
  name: string;
  fullName: string;
  tagline: Localized<string>;
  biography: Localized<string>;
  portrait: ImageAsset;
  email: string;
  instagramUrl: string;
  youtubeUrl: string;
}

/** Locale-resolved shape handed to components. */
export interface ResolvedProfile {
  name: string;
  fullName: string;
  tagline: string;
  biography: string;
  portrait: ImageAsset;
  email: string;
  instagramUrl: string;
  youtubeUrl: string;
}
