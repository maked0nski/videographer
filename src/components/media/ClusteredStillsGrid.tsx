"use client";

import { useState } from "react";
import Image from "next/image";
import type { ImageAsset, StillItem } from "@/types";
import { groupIntoRows } from "@/lib/gallery-layout";
import { Lightbox } from "./Lightbox";

function isImageItem(item: StillItem): item is { kind: "image"; image: ImageAsset } {
  return item.kind === "image";
}

function StillTile({ item }: { item: StillItem }) {
  if (item.kind === "video") {
    return (
      <video src={item.url} muted loop autoPlay playsInline className="h-full w-full object-cover" />
    );
  }
  return (
    <Image src={item.image.url} alt={item.image.alt} fill sizes="50vw" className="object-cover" />
  );
}

/**
 * Shared grid engine for Film Stills, Behind the Scenes, and Photo Gallery.
 * Rows are grouped by orientation (`groupIntoRows`); within a row, each
 * item's flex-grow equals its own aspect ratio, so the browser distributes
 * width proportionally and every image renders at its true aspect ratio
 * with zero client-side measurement (docs/superpowers/specs/2026-07-21-project-page-gallery-redesign-design.md).
 */
export function ClusteredStillsGrid({
  items,
  defaultDisplayCount,
  lightboxLabels,
}: {
  items: StillItem[];
  defaultDisplayCount: number;
  lightboxLabels: { close: string; next: string; previous: string };
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const visibleItems = items.slice(0, defaultDisplayCount);
  const overflowItems = items.slice(defaultDisplayCount);
  const rows = groupIntoRows(visibleItems);

  const lightboxImages = items.filter(isImageItem).map((item) => item.image);
  const lightboxIndexByItemIndex = new Map<number, number>();
  let lightboxCounter = 0;
  items.forEach((item, itemIndex) => {
    if (isImageItem(item)) {
      lightboxIndexByItemIndex.set(itemIndex, lightboxCounter);
      lightboxCounter += 1;
    }
  });

  const renderTile = (item: StillItem, itemIndex: number, tileClassName: string) => {
    const lightboxIndex = lightboxIndexByItemIndex.get(itemIndex);
    if (isImageItem(item) && lightboxIndex !== undefined) {
      return (
        <button
          key={itemIndex}
          type="button"
          onClick={() => setOpenIndex(lightboxIndex)}
          className={`bg-bg-secondary relative overflow-hidden ${tileClassName}`}
        >
          <StillTile item={item} />
        </button>
      );
    }
    return (
      <div key={itemIndex} className={`bg-bg-secondary relative overflow-hidden ${tileClassName}`}>
        <StillTile item={item} />
      </div>
    );
  };

  return (
    <div>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="mb-2 flex h-[220px] gap-2 sm:h-[260px] lg:h-[300px]">
          {row.items.map(({ itemIndex, aspectRatio }) => (
            <div key={itemIndex} style={{ flexGrow: aspectRatio, flexShrink: 1, flexBasis: 0 }}>
              {renderTile(items[itemIndex], itemIndex, "h-full w-full")}
            </div>
          ))}
        </div>
      ))}

      {overflowItems.length > 0 && (
        <div className="border-border mt-4 flex gap-2 overflow-x-auto border-t border-dashed pt-3">
          {overflowItems.map((item, offset) =>
            renderTile(item, defaultDisplayCount + offset, "h-16 w-16 flex-shrink-0"),
          )}
        </div>
      )}

      {openIndex !== null && (
        <Lightbox
          images={lightboxImages}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNext={() => setOpenIndex((current) => ((current ?? 0) + 1) % lightboxImages.length)}
          onPrevious={() =>
            setOpenIndex((current) => ((current ?? 0) - 1 + lightboxImages.length) % lightboxImages.length)
          }
          labels={lightboxLabels}
        />
      )}
    </div>
  );
}
