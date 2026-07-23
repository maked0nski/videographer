/**
 * Image shape returned by `lib/content/queries.ts`, resolved from Sanity's
 * asset reference.
 */
export interface ImageAsset {
  url: string;
  alt: string;
  width: number;
  height: number;
  /** Tiny inline placeholder for blur-up loading, when available. */
  blurDataURL?: string;
}
