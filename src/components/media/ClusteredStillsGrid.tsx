"use client";

import { useState } from "react";
import Image from "next/image";
import type { ImageAsset, StillItem } from "@/types";
import { groupIntoRows } from "@/lib/gallery-layout";
import { Lightbox } from "./Lightbox";

/** Gap (px) between tiles in a row; must match the `gap-2` class used on the row's flex container. */
const ROW_GAP_PX = 8;

function isImageItem(item: StillItem): item is { kind: "image"; image: ImageAsset } {
  return item.kind === "image";
}

function StillTile({ item, sizes = "50vw" }: { item: StillItem; sizes?: string }) {
  if (item.kind === "video") {
    return (
      <video src={item.url} muted loop autoPlay playsInline className="h-full w-full object-cover" />
    );
  }
  return (
    <Image
      src={item.image.url}
      alt={item.image.alt}
      fill
      sizes={sizes}
      className="object-cover transition-transform duration-300 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100"
    />
  );
}

/**
 * Shared grid engine for Film Stills, Behind the Scenes, and Photo Gallery.
 * Rows are grouped by orientation (`groupIntoRows`); each row's height is
 * derived from its own container-query width divided by the row's summed
 * aspect ratio, so every item's flex-grow-computed width exactly equals
 * height × its own aspect ratio — a true justified layout with zero
 * cropping, computed entirely by the browser's layout pass (no
 * client-side measurement, no layout shift).
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

  const renderTile = (
    item: StillItem,
    itemIndex: number,
    tileClassName: string,
    sizes?: string,
  ) => {
    const lightboxIndex = lightboxIndexByItemIndex.get(itemIndex);
    if (isImageItem(item) && lightboxIndex !== undefined) {
      return (
        <button
          key={itemIndex}
          type="button"
          onClick={() => setOpenIndex(lightboxIndex)}
          className={`bg-bg-secondary relative overflow-hidden ${tileClassName}`}
        >
          <StillTile item={item} sizes={sizes} />
        </button>
      );
    }
    return (
      <div key={itemIndex} className={`bg-bg-secondary relative overflow-hidden ${tileClassName}`}>
        <StillTile item={item} sizes={sizes} />
      </div>
    );
  };

  return (
    <div>
      {rows.map((row, rowIndex) => {
        const sumAspectRatio = row.items.reduce((sum, item) => sum + item.aspectRatio, 0);
        const totalGapPx = ROW_GAP_PX * (row.items.length - 1);
        const availableWidth = `(100cqw - ${totalGapPx}px)`;
        const rowHeight = `calc(${availableWidth} / max(1, ${sumAspectRatio}))`;
        const rowWidth = `calc(${availableWidth} / max(1, ${sumAspectRatio}) * ${sumAspectRatio} + ${totalGapPx}px)`;
        return (
          <div
            key={rowIndex}
            className="mb-2 flex justify-center"
            style={{ containerType: "inline-size" }}
          >
            <div className="flex gap-2" style={{ height: rowHeight, width: rowWidth }}>
              {row.items.map(({ itemIndex, aspectRatio }) => (
                <div key={itemIndex} style={{ flexGrow: aspectRatio, flexShrink: 1, flexBasis: 0 }}>
                  {renderTile(items[itemIndex], itemIndex, "h-full w-full")}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {overflowItems.length > 0 && (
        <div className="border-border mt-4 flex justify-center gap-2 overflow-x-auto border-t border-dashed pt-3">
          {overflowItems.map((item, offset) =>
            renderTile(item, defaultDisplayCount + offset, "h-16 w-16 flex-shrink-0", "64px"),
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
