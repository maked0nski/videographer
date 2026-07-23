/**
 * CMS-agnostic image shape. The seed data layer and the Sanity data layer both
 * resolve to exactly this shape, so components never know or care which one is
 * behind `lib/content/queries.ts` (constitution Principle I).
 */
export interface ImageAsset {
  url: string;
  alt: string;
  width: number;
  height: number;
  /** Tiny inline placeholder for blur-up loading, when available. */
  blurDataURL?: string;
}
