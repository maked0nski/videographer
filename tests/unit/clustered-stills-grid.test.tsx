import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClusteredStillsGrid } from "@/components/media/ClusteredStillsGrid";
import type { StillItem } from "@/types";

vi.mock("next/image", () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

const labels = { close: "Close", next: "Next", previous: "Previous" };

function image(alt: string, width = 1920, height = 1080): StillItem {
  return { kind: "image", image: { url: `/${alt}.jpg`, alt, width, height } };
}

describe("ClusteredStillsGrid", () => {
  it("renders every item — default count in the grid, the rest in the overflow filmstrip", () => {
    const items = Array.from({ length: 10 }, (_, i) => image(`still-${i}`));
    render(<ClusteredStillsGrid items={items} defaultDisplayCount={8} lightboxLabels={labels} />);

    expect(screen.getAllByRole("img")).toHaveLength(10);
    expect(screen.getByAltText("still-0")).toBeInTheDocument();
    expect(screen.getByAltText("still-9")).toBeInTheDocument();
  });

  it("opens the Lightbox at the clicked image's position and navigates across the full set", async () => {
    const user = userEvent.setup();
    const items = Array.from({ length: 3 }, (_, i) => image(`still-${i}`));
    render(<ClusteredStillsGrid items={items} defaultDisplayCount={8} lightboxLabels={labels} />);

    await user.click(screen.getByAltText("still-1").closest("button")!);
    const dialog = screen.getByRole("dialog");
    expect(dialog.querySelector("img")).toHaveAttribute("alt", "still-1");

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(dialog.querySelector("img")).toHaveAttribute("alt", "still-2");
  });

  it("renders a BTS video clip as a muted looping video that is not clickable into the Lightbox", () => {
    const items: StillItem[] = [{ kind: "video", url: "/clip.mp4", orientation: "landscape" }];
    render(<ClusteredStillsGrid items={items} defaultDisplayCount={8} lightboxLabels={labels} />);

    const video = document.querySelector("video") as HTMLVideoElement;
    expect(video).toBeInTheDocument();
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.autoplay).toBe(true);
    expect(video.closest("button")).toBeNull();
  });

  it("floors a lone portrait row's height so it's never taller than wide, and centers it", () => {
    // A single portrait item with no landscape neighbor to merge into (src/lib/gallery-layout.ts's
    // mergeOrphanRows has nothing to merge it with) — this is the one case where the height floor
    // in ClusteredStillsGrid actually has to do anything; any row with 2+ items merged via Task 1
    // already has a combined aspect ratio at or above 1.
    const items = [image("tall", 800, 1600)];
    const { container } = render(
      <ClusteredStillsGrid items={items} defaultDisplayCount={8} lightboxLabels={labels} />,
    );

    const rowWrappers = container.querySelectorAll(":scope > div > div.flex.justify-center");
    expect(rowWrappers).toHaveLength(1);

    const row = rowWrappers[0].querySelector(":scope > div.flex.gap-2") as HTMLElement;
    // jsdom's CSSOM re-serializes calc() (folds max(), rewrites division as multiplication
    // by the reciprocal) rather than preserving the authored expression verbatim, so assert
    // on the resulting `100cqw` coefficients rather than an exact calc() string.
    const cqwCoefficient = (calcExpr: string) => Number(calcExpr.match(/([\d.]+)\s*\*\s*\(100cqw/)?.[1]);

    // Without the floor, height's coefficient would be 1/0.5 = 2 (twice the container width).
    // The floor clamps max(1, sumAspectRatio) to 1, so height's coefficient is 1: the row is
    // never taller than the container is wide.
    expect(cqwCoefficient(row.style.height)).toBeCloseTo(1);
    // Width keeps the item's true aspect ratio (0.5) instead of stretching to fill 100% —
    // the row ends up narrower than the container and centered by the `justify-center` wrapper.
    expect(cqwCoefficient(row.style.width)).toBeCloseTo(0.5);
  });

  it("centers the overflow filmstrip instead of left-aligning it", () => {
    const items = Array.from({ length: 3 }, (_, i) => image(`still-${i}`));
    const { container } = render(
      <ClusteredStillsGrid items={items} defaultDisplayCount={1} lightboxLabels={labels} />,
    );

    const filmstrip = container.querySelector(".overflow-x-auto") as HTMLElement;
    expect(filmstrip).toHaveClass("justify-center");
  });
});
