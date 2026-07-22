# Gallery Orphan-Row Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop lone portrait photos in `ClusteredStillsGrid` (Film Stills / Behind the Scenes / Photo Gallery) from rendering as an excessively tall full-bleed row, by merging them into a neighboring row instead, with a height-floor fallback for when no neighbor is available.

**Architecture:** Two isolated changes. `src/lib/gallery-layout.ts`'s pure `groupIntoRows` function gains balanced chunk sizing for portrait runs and a post-pass that merges any surviving single-item portrait row into an adjacent row (forward preferred, then backward, then left standalone). `src/components/media/ClusteredStillsGrid.tsx` gains a row-height floor (a row is never taller than it is wide) with the row centered instead of stretched full-width when the floor applies, plus centers the overflow filmstrip instead of left-aligning it.

**Tech Stack:** TypeScript, React 19, Next.js 16, Vitest + Testing Library (jsdom).

## Global Constraints

- No cropping anywhere in `ClusteredStillsGrid` — every layout change must preserve each image's true aspect ratio (no `object-cover` introduced for cases that don't already use it).
- Existing landscape-orphan behavior is intentional and must not change: a lone landscape item still renders as its own full-width row (docs/superpowers/specs/2026-07-22-gallery-orphan-row-fix-design.md, "Context").
- No reordering of items — items are laid out in the order Sanity/the seed data authors them; merges only ever pull an orphan into the row immediately before or after it.

---

### Task 1: Balanced portrait chunking + orphan-row merge in `groupIntoRows`

**Files:**
- Modify: `src/lib/gallery-layout.ts`
- Test: `tests/unit/gallery-layout.test.ts`

**Interfaces:**
- Consumes: nothing new — same `StillItem[]` input as today (`src/types/gallery.ts`).
- Produces: `groupIntoRows(items: StillItem[]): StillRow[]` — same exported signature and `StillRow` shape as today (`{ orientation: StillOrientation; items: { itemIndex: number; aspectRatio: number }[] }`). Task 2 consumes this function's output as-is.

- [ ] **Step 1: Write the failing tests**

Replace the existing "starts a new row when orientation changes, even mid-run" test (its expectation describes the exact bug this task fixes) and add new cases, in `tests/unit/gallery-layout.test.ts`:

```typescript
  it("merges a trailing lone portrait row backward into the preceding row", () => {
    const items = [portraitImage(), portraitImage(), landscapeImage(), portraitImage()];
    const rows = groupIntoRows(items);
    expect(rows.map((row) => ({ orientation: row.orientation, count: row.items.length }))).toEqual([
      { orientation: "portrait", count: 2 },
      { orientation: "landscape", count: 2 },
    ]);
  });

  it("merges a lone landscape+portrait pair (the reported Behind the Scenes case) into one row", () => {
    const rows = groupIntoRows([landscapeImage(), portraitImage()]);
    expect(rows).toHaveLength(1);
    expect(rows[0].items).toHaveLength(2);
    expect(rows[0].items[0].aspectRatio).toBeCloseTo(1920 / 1080);
    expect(rows[0].items[1].aspectRatio).toBeCloseTo(1080 / 1920);
  });

  it("prefers merging a lone portrait forward into the next row over backward", () => {
    const rows = groupIntoRows([portraitImage(), landscapeImage()]);
    expect(rows).toHaveLength(1);
    expect(rows[0].orientation).toBe("landscape");
    expect(rows[0].items.map((item) => item.itemIndex)).toEqual([0, 1]);
  });

  it("falls back to merging backward when the next row is already full", () => {
    const items = [landscapeImage(), portraitImage(), landscapeImage(), landscapeImage()];
    const rows = groupIntoRows(items);
    expect(rows.map((row) => row.items.length)).toEqual([2, 2]);
    expect(rows[0].items.map((item) => item.itemIndex)).toEqual([0, 1]);
  });

  it("leaves a lone portrait standalone when both neighboring rows are already full", () => {
    const items = [
      landscapeImage(),
      landscapeImage(),
      portraitImage(),
      landscapeImage(),
      landscapeImage(),
    ];
    const rows = groupIntoRows(items);
    expect(rows.map((row) => ({ orientation: row.orientation, count: row.items.length }))).toEqual([
      { orientation: "landscape", count: 2 },
      { orientation: "portrait", count: 1 },
      { orientation: "landscape", count: 2 },
    ]);
  });

  it("balances a portrait run of 5 into rows of 3 and 2 instead of leaving a trailing lone row", () => {
    const items = Array.from({ length: 5 }, () => portraitImage());
    const rows = groupIntoRows(items);
    expect(rows.map((row) => row.items.length)).toEqual([3, 2]);
  });

  it("balances a portrait run of 9 into three rows of 3", () => {
    const items = Array.from({ length: 9 }, () => portraitImage());
    const rows = groupIntoRows(items);
    expect(rows.map((row) => row.items.length)).toEqual([3, 3, 3]);
  });
```

Delete the old test named `"starts a new row when orientation changes, even mid-run"` — it's replaced by `"merges a trailing lone portrait row backward into the preceding row"` above, which covers the same input with the corrected (post-fix) expectation.

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `npx vitest run tests/unit/gallery-layout.test.ts`
Expected: the 7 new tests FAIL (current code has no merging or balanced chunking); the pre-existing tests you didn't touch (5 landscape → `[2,2,1]`, 7 portrait → `[4,3]`, single-item aspect ratio, video clip orientation, empty list) still PASS.

- [ ] **Step 3: Implement balanced chunking and orphan merging**

Replace the full contents of `src/lib/gallery-layout.ts` with:

```typescript
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
 * Behind the Scenes section, docs/superpowers/specs/2026-07-22-gallery-orphan-row-fix-design.md).
 * Merge it into whichever neighboring row has room instead — preferring the
 * next row, then the previous one — so it shares a row's height rather than
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
 * portrait row is merged into a neighboring row (see `mergeOrphanRows`).
 * This is the "banded justified grid" from
 * docs/superpowers/specs/2026-07-21-project-page-gallery-redesign-design.md,
 * extended by the orphan-row fix from
 * docs/superpowers/specs/2026-07-22-gallery-orphan-row-fix-design.md.
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/gallery-layout.test.ts`
Expected: all tests PASS (12 total: 5 pre-existing untouched + 7 new/replacement).

- [ ] **Step 5: Commit**

```bash
git add src/lib/gallery-layout.ts tests/unit/gallery-layout.test.ts
git commit -m "fix: merge orphaned single-portrait gallery rows into a neighboring row"
```

---

### Task 2: Row-height floor + centered overflow filmstrip in `ClusteredStillsGrid`

**Files:**
- Modify: `src/components/media/ClusteredStillsGrid.tsx`
- Test: `tests/unit/clustered-stills-grid.test.tsx`

**Interfaces:**
- Consumes: `groupIntoRows` from Task 1 (`src/lib/gallery-layout.ts`), unchanged import already present in this file.
- Produces: no new exports — `ClusteredStillsGrid`'s existing props/behavior are unchanged; only the row wrapper's inline styles and the filmstrip's alignment class change.

- [ ] **Step 1: Write the failing tests**

Add to `tests/unit/clustered-stills-grid.test.tsx` (add `import { itemIndex: 0 }`-style access isn't needed — query the DOM directly):

```typescript
  it("floors a lone portrait row's height so it's never taller than wide, and centers it", () => {
    const items = [image("wide", 1920, 1080), image("tall", 800, 1600)];
    const { container } = render(
      <ClusteredStillsGrid items={items} defaultDisplayCount={8} lightboxLabels={labels} />,
    );

    const rowWrappers = container.querySelectorAll(":scope > div > div.flex.justify-center");
    expect(rowWrappers).toHaveLength(1);

    const row = rowWrappers[0].querySelector(":scope > div.flex.gap-2") as HTMLElement;
    expect(row.style.height).toBe("calc((100cqw - 8px) / max(1, 2.2777777777777777))");
    expect(row.style.width).toBe(
      "calc((100cqw - 8px) / max(1, 2.2777777777777777) * 2.2777777777777777 + 8px)",
    );
  });

  it("centers the overflow filmstrip instead of left-aligning it", () => {
    const items = Array.from({ length: 3 }, (_, i) => image(`still-${i}`));
    const { container } = render(
      <ClusteredStillsGrid items={items} defaultDisplayCount={1} lightboxLabels={labels} />,
    );

    const filmstrip = container.querySelector(".overflow-x-auto") as HTMLElement;
    expect(filmstrip).toHaveClass("justify-center");
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/clustered-stills-grid.test.tsx`
Expected: both new tests FAIL — the row wrapper isn't wrapped in a `justify-center` flex div yet, and the filmstrip has no `justify-center` class. The 3 pre-existing tests still PASS.

- [ ] **Step 3: Implement the height floor, centering, and filmstrip alignment**

In `src/components/media/ClusteredStillsGrid.tsx`, replace the row-rendering block inside the `return`:

```typescript
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
```

(This replaces the old block that set only `height` on the row div with a plain `flex gap-2` outer wrapper and no `max(1, …)` floor.)

Then update the overflow filmstrip's className:

```typescript
      {overflowItems.length > 0 && (
        <div className="border-border mt-4 flex justify-center gap-2 overflow-x-auto border-t border-dashed pt-3">
```

(Only the className string changes — insert `justify-center` after `flex`; the rest of that block, including the `overflowItems.map(...)` body, is unchanged.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/clustered-stills-grid.test.tsx`
Expected: all 5 tests PASS (3 pre-existing + 2 new).

- [ ] **Step 5: Run the full unit suite and typecheck**

Run: `npm run test:unit`
Expected: all tests PASS, no failures anywhere else in the suite.

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/media/ClusteredStillsGrid.tsx tests/unit/clustered-stills-grid.test.tsx
git commit -m "fix: floor lone gallery row height and center it, center overflow filmstrip"
```
