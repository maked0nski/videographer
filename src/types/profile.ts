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
  linkedinUrl?: string;
  facebookUrl?: string;
  /** Personal video presentation shown on the About page; hidden entirely when unset. */
  aboutVideoUrl?: string;
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
  linkedinUrl?: string;
  facebookUrl?: string;
  aboutVideoUrl?: string;
}
