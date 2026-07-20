import { describe, expect, it, vi } from "vitest";

const baseProfileFixture = {
  name: "YERRMAK",
  fullName: "Viktor Yermakov",
  tagline: { en: "Tagline", uk: "Тег" },
  biography: { en: "Bio", uk: "Біо" },
  portrait: { url: "/portrait.jpg", alt: "Portrait", width: 1, height: 1 },
  email: "test@example.com",
  instagramUrl: "https://www.instagram.com/test",
  youtubeUrl: "https://www.youtube.com/@test",
};

describe("getProfile (seed-backed) — aboutVideoUrl", () => {
  it("passes through aboutVideoUrl when set on the seed profile", async () => {
    vi.doMock("@/data/seed", () => ({
      profile: { ...baseProfileFixture, aboutVideoUrl: "https://youtu.be/y8wpTiXLE-w" },
      projects: [],
      siteSettings: { showreelUrl: "", contactCtaText: { en: "", uk: "" } },
    }));
    vi.resetModules();
    const { getProfile } = await import("@/lib/content/seed-queries");
    const profile = await getProfile("en");
    expect(profile.aboutVideoUrl).toBe("https://youtu.be/y8wpTiXLE-w");
  });

  it("omits aboutVideoUrl when not set on the seed profile", async () => {
    vi.doMock("@/data/seed", () => ({
      profile: baseProfileFixture,
      projects: [],
      siteSettings: { showreelUrl: "", contactCtaText: { en: "", uk: "" } },
    }));
    vi.resetModules();
    const { getProfile } = await import("@/lib/content/seed-queries");
    const profile = await getProfile("en");
    expect(profile.aboutVideoUrl).toBeUndefined();
  });
});
