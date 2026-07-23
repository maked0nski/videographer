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
 * Chunk sizes for one same-orientation run. Landscape runs chunk greedily —
 * a trailing remainder under `maxChunk` is fine, since a lone landscape item
 * is never taller than it is wide and reads as an intentional wide/cinematic
 * single-row treatment. Portrait runs balance chunk sizes instead: a lone
 * *trailing* portrait item would render far taller than wide, so balancing
 * ensures no chunk (other than a whole run of exactly 1, handled separately
 * by `mergeOrphanRows`) is ever left at size 1.
 */
function chunkSizes(runLength: number, maxChunk: number, balanced: boolean): number[] {
  if (!balanced) {
    const sizes: number[] = [];
    let remaining = runLength;
    while (remaining > 0) {
      const size = Math.min(maxChunk, remaining);
      sizes.push(size);
      remaining -= size;
    }
    return sizes;
  }

  const numChunks = Math.ceil(runLength / maxChunk);
  const base = Math.floor(runLength / numChunks);
  const extra = runLength % numChunks;
  return Array.from({ length: numChunks }, (_, i) => (i < extra ? base + 1 : base));
}

function rowCapacity(row: StillRow): number {
  return row.orientation === "portrait" ? PORTRAIT_ROW_SIZE : LANDSCAPE_ROW_SIZE;
}

/**
 * A lone portrait item left as its own row renders far taller than wide (its
 * width fills the full container, so height = containerWidth / aspectRatio
 * with aspectRatio well under 1 — confirmed live on `the-withshaw-case`'s
 * Behind the Scenes section). Merge it into whichever neighboring row has
 * room instead — preferring the next row, then the previous one — so it
 * shares a row's height rather than
 * getting a full-bleed row of its own. Landscape orphans are left alone: a
 * lone landscape item is never taller than it is wide, so it's a fine
 * intentional "hero" row as-is.
 */
function mergeOrphanRows(rows: StillRow[]): StillRow[] {
  const result = rows.map((row) => ({ orientation: row.orientation, items: [...row.items] }));

  for (let i = 0; i < result.length; i += 1) {
    const row = result[i];
    const isOrphan = row.items.length === 1 && row.orientation === "portrait";
    if (!isOrphan) continue;

    const next = result[i + 1];
    if (next && next.items.length < rowCapacity(next)) {
      next.items = [...row.items, ...next.items];
      result.splice(i, 1);
      i -= 1;
      continue;
    }

    const previous = result[i - 1];
    if (previous && previous.items.length < rowCapacity(previous)) {
      previous.items = [...previous.items, ...row.items];
      result.splice(i, 1);
      i -= 1;
    }
  }

  return result;
}

/**
 * Groups items into same-orientation rows without reordering them — runs of
 * consecutive portrait items become rows of up to 4, runs of consecutive
 * landscape items become rows of up to 2, then any isolated single-item
 * portrait row is merged into a neighboring row (see `mergeOrphanRows`) —
 * a "banded justified grid".
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

    const maxChunk = orientation === "portrait" ? PORTRAIT_ROW_SIZE : LANDSCAPE_ROW_SIZE;
    const sizes = chunkSizes(runEnd - runStart, maxChunk, orientation === "portrait");
    let chunkStart = runStart;
    for (const size of sizes) {
      const chunkEnd = chunkStart + size;
      const rowItems: StillRow["items"] = [];
      for (let itemIndex = chunkStart; itemIndex < chunkEnd; itemIndex += 1) {
        rowItems.push({ itemIndex, aspectRatio: itemAspectRatio(items[itemIndex]) });
      }
      rows.push({ orientation, items: rowItems });
      chunkStart = chunkEnd;
    }

    runStart = runEnd;
  }

  return mergeOrphanRows(rows);
}
