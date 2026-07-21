import type { ImageAsset } from "./image";

export type StillOrientation = "landscape" | "portrait";

/**
 * A Behind the Scenes item is either a plain photo or a short looping video
 * clip. Sanity doesn't extract width/height for video files the way it does
 * for images, so video items carry an explicit orientation instead of a
 * measured aspect ratio (see docs/superpowers/specs/2026-07-21-project-page-gallery-redesign-design.md).
 */
export type StillItem =
  | { kind: "image"; image: ImageAsset }
  | { kind: "video"; url: string; orientation: StillOrientation };
