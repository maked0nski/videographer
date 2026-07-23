import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

const baseProject = {
  slug: "the-withshaw-case",
  type: "video" as const,
  title: "The Withshaw Case",
  year: "2025",
  role: "Cinematographer",
  description: "A thriller-drama.",
  coverImage: { url: "/cover.jpg", alt: "The Withshaw Case cover", width: 1600, height: 1000 },
  order: "1",
  featured: true,
};

vi.mock("@/lib/content/queries", () => ({
  getProjectBySlug: vi.fn(),
  getAdjacentProjects: vi.fn().mockResolvedValue({ previous: null, next: null }),
  getSiteSettings: vi.fn().mockResolvedValue({
    yearFieldLabel: "Year",
    locationFieldLabel: "Location",
    roleFieldLabel: "Role",
    producerDirectorFieldLabel: "Producer / Director",
    recognitionFieldLabel: "Recognition",
    cameraFieldLabel: "Camera",
    lensesFieldLabel: "Lenses",
    behindTheScenesHeading: "Behind the Scenes",
    filmStillsHeading: "Film Stills",
    previousProjectLabel: "Previous project",
    nextProjectLabel: "Next project",
    galleryDefaultDisplayCount: 8,
  }),
}));

describe("Project detail page — video without youtubeUrl", () => {
  it("renders the cover image with no play button when youtubeUrl is missing", async () => {
    const { getProjectBySlug } = await import("@/lib/content/queries");
    vi.mocked(getProjectBySlug).mockResolvedValue(baseProject);
    const { default: ProjectPage } = await import("@/app/[locale]/work/[slug]/page");

    const element = await ProjectPage({
      params: Promise.resolve({ locale: "en", slug: "the-withshaw-case" }),
    });
    render(element);

    const coverImage = screen.getByAltText("The Withshaw Case cover");
    expect(coverImage).toHaveAttribute("src", "/cover.jpg");
    expect(screen.queryByRole("button", { name: /play video/i })).not.toBeInTheDocument();
  });

  it("renders the interactive HeroVideoPlayer when youtubeUrl is present", async () => {
    const { getProjectBySlug } = await import("@/lib/content/queries");
    vi.mocked(getProjectBySlug).mockResolvedValue({
      ...baseProject,
      youtubeUrl: "https://www.youtube.com/watch?v=abc123",
    });
    const { default: ProjectPage } = await import("@/app/[locale]/work/[slug]/page");

    const element = await ProjectPage({
      params: Promise.resolve({ locale: "en", slug: "the-withshaw-case" }),
    });
    render(element);

    expect(screen.getByRole("button", { name: /play video/i })).toBeInTheDocument();
  });
});
