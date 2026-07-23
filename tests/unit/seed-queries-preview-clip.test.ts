import { describe, expect, it, vi } from "vitest";

const baseProject = {
  slug: "the-withshaw-case",
  type: "video" as const,
  title: { en: "The Withshaw Case", uk: "The Withshaw Case" },
  year: "2025",
  role: { en: "Cinematographer", uk: "Оператор" },
  description: { en: "A thriller-drama.", uk: "Триллер." },
  coverImage: { url: "/cover.jpg", alt: "Cover", width: 1600, height: 1000 },
  order: 1,
  featured: true,
  published: true,
};

describe("getProjectBySlug (seed-backed)", () => {
  it("passes through previewClipUrl when set on the seed project", async () => {
    vi.doMock("@/data/seed", () => ({
      profile: {},
      projects: [{ ...baseProject, previewClipUrl: "/previews/the-withshaw-case.mp4" }],
      siteSettings: { showreelUrl: "", contactCtaText: { en: "", uk: "" } },
    }));
    vi.resetModules();
    const { getProjectBySlug } = await import("@/lib/content/seed-queries");
    const project = await getProjectBySlug("the-withshaw-case", "en");
    expect(project?.previewClipUrl).toBe("/previews/the-withshaw-case.mp4");
  });

  it("omits previewClipUrl when not set on the seed project", async () => {
    vi.doMock("@/data/seed", () => ({
      profile: {},
      projects: [baseProject],
      siteSettings: { showreelUrl: "", contactCtaText: { en: "", uk: "" } },
    }));
    vi.resetModules();
    const { getProjectBySlug } = await import("@/lib/content/seed-queries");
    const project = await getProjectBySlug("the-withshaw-case", "en");
    expect(project?.previewClipUrl).toBeUndefined();
  });
});
