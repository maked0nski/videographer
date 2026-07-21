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

  it("starts a new row when orientation changes, even mid-run", () => {
    const items = [portraitImage(), portraitImage(), landscapeImage(), portraitImage()];
    const rows = groupIntoRows(items);
    expect(rows.map((row) => ({ orientation: row.orientation, count: row.items.length }))).toEqual([
      { orientation: "portrait", count: 2 },
      { orientation: "landscape", count: 1 },
      { orientation: "portrait", count: 1 },
    ]);
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
