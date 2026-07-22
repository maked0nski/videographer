import { describe, expect, it } from "vitest";
import { groupIntoRows } from "@/lib/gallery-layout";
import type { StillItem } from "@/types";

function landscapeImage(): StillItem {
  return { kind: "image", image: { url: "/l.jpg", alt: "", width: 1920, height: 1080 } };
}
function portraitImage(): StillItem {
  return { kind: "image", image: { url: "/p.jpg", alt: "", width: 1080, height: 1920 } };
}

describe("groupIntoRows", () => {
  it("splits a run of 5 landscape images into rows of 2, 2, 1", () => {
    const items = [
      landscapeImage(),
      landscapeImage(),
      landscapeImage(),
      landscapeImage(),
      landscapeImage(),
    ];
    const rows = groupIntoRows(items);
    expect(rows.map((row) => row.items.length)).toEqual([2, 2, 1]);
    expect(rows.every((row) => row.orientation === "landscape")).toBe(true);
  });

  it("splits a run of 7 portrait images into rows of 4, 3", () => {
    const items = Array.from({ length: 7 }, () => portraitImage());
    const rows = groupIntoRows(items);
    expect(rows.map((row) => row.items.length)).toEqual([4, 3]);
    expect(rows.every((row) => row.orientation === "portrait")).toBe(true);
  });

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

  it("uses each item's own aspect ratio for its row entry", () => {
    const rows = groupIntoRows([landscapeImage()]);
    expect(rows[0].items[0].aspectRatio).toBeCloseTo(1920 / 1080);
  });

  it("classifies a BTS video clip's orientation from its explicit field, not pixel dimensions", () => {
    const clip: StillItem = { kind: "video", url: "/clip.mp4", orientation: "portrait" };
    const rows = groupIntoRows([clip, portraitImage()]);
    expect(rows).toHaveLength(1);
    expect(rows[0].orientation).toBe("portrait");
    expect(rows[0].items[0].aspectRatio).toBeCloseTo(9 / 16);
  });

  it("returns no rows for an empty item list", () => {
    expect(groupIntoRows([])).toEqual([]);
  });
});
