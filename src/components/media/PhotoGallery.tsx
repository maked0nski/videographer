"use client";

import { useState } from "react";
import Image from "next/image";
import type { ImageAsset } from "@/types";
import { Lightbox } from "./Lightbox";

export function PhotoGallery({
  images,
  lightboxLabels,
}: {
  images: ImageAsset[];
  lightboxLabels: { close: string; next: string; previous: string };
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {images.map((image, index) => (
          <button
            key={image.url}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="bg-bg-secondary relative aspect-[4/5] overflow-hidden"
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(min-width: 640px) 33vw, 50vw"
              loading="lazy"
              className="object-cover transition-transform duration-300 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          images={images}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNext={() => setOpenIndex((current) => ((current ?? 0) + 1) % images.length)}
          onPrevious={() =>
            setOpenIndex((current) => ((current ?? 0) - 1 + images.length) % images.length)
          }
          labels={lightboxLabels}
        />
      )}
    </div>
  );
}
