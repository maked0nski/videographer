import type { StillItem, StillOrientation } from "@/types";

const LANDSCAPE_ROW_SIZE = 2;
const PORTRAIT_ROW_SIZE = 4;

function itemOrientation(item: StillItem): StillOrientation {
  if (item.kind === "video") return item.orientation;
  return item.image.height > item.image.width ? "portrait" : "landscape";
}

function itemAspectRatio(item: StillItem): number {
  if (item.kind === "video") return item.orientation === "portrait" ? 9 / 16 : 16 / 9;
  return item.image.width / item.image.height;
}

export interface StillRow {
  orientation: StillOrientation;
  items: { itemIndex: number; aspectRatio: number }[];
}

/**
 * Groups items into same-orientation rows without reordering them — runs of
 * consecutive portrait items become rows of up to 4, runs of consecutive
 * landscape items become rows of up to 2. This is the "banded justified
 * grid" from docs/superpowers/specs/2026-07-21-project-page-gallery-redesign-design.md.
 */
export function groupIntoRows(items: StillItem[]): StillRow[] {
  const rows: StillRow[] = [];
  let runStart = 0;

  while (runStart < items.length) {
    const orientation = itemOrientation(items[runStart]);
    let runEnd = runStart;
    while (runEnd < items.length && itemOrientation(items[runEnd]) === orientation) {
      runEnd += 1;
    }

    const chunkSize = orientation === "portrait" ? PORTRAIT_ROW_SIZE : LANDSCAPE_ROW_SIZE;
    let chunkStart = runStart;
    while (chunkStart < runEnd) {
      const chunkEnd = Math.min(chunkStart + chunkSize, runEnd);
      const rowItems: StillRow["items"] = [];
      for (let itemIndex = chunkStart; itemIndex < chunkEnd; itemIndex += 1) {
        rowItems.push({ itemIndex, aspectRatio: itemAspectRatio(items[itemIndex]) });
      }
      rows.push({ orientation, items: rowItems });
      chunkStart = chunkEnd;
    }

    runStart = runEnd;
  }

  return rows;
}
