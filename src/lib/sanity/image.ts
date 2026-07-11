import { createImageUrlBuilder } from "@sanity/image-url";
import type { Image } from "sanity";
import type { ImageAsset } from "@/types";
import { sanityClient } from "./client";

const builder = createImageUrlBuilder(sanityClient);

type SanityImageValue = Image & {
  alt?: string;
  asset?: { metadata?: { dimensions?: { width: number; height: number } } };
};

/** Resolves a Sanity image field to the CMS-agnostic `ImageAsset` shape. */
export function toImageAsset(image: SanityImageValue | undefined, fallbackAlt = ""): ImageAsset {
  if (!image?.asset) {
    return { url: "", alt: fallbackAlt, width: 1, height: 1 };
  }

  const dimensions = image.asset.metadata?.dimensions ?? { width: 1600, height: 1000 };

  return {
    url: builder.image(image).width(1600).fit("max").auto("format").url(),
    alt: image.alt || fallbackAlt,
    width: dimensions.width,
    height: dimensions.height,
  };
}
