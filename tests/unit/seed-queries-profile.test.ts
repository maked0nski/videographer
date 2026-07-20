import { describe, expect, it, vi } from "vitest";

vi.mock("@/data/seed", () => ({
  profile: {
    name: "YERRMAK",
    fullName: "Viktor Yermakov",
    tagline: { en: "Tagline", uk: "Тег" },
    biography: { en: "Bio", uk: "Біо" },
    portrait: { url: "/portrait.jpg", alt: "Portrait", width: 1, height: 1 },
    email: "test@example.com",
    instagramUrl: "https://www.instagram.com/test",
    youtubeUrl: "https://www.youtube.com/@test",
    linkedinUrl: "https://www.linkedin.com/in/test",
    facebookUrl: "https://www.facebook.com/test",
  },
  projects: [],
  siteSettings: {
    showreelUrl: "",
    contactCtaText: { en: "", uk: "" },
  },
}));

import { getProfile } from "@/lib/content/seed-queries";

describe("getProfile (seed-backed)", () => {
  it("passes through optional linkedinUrl and facebookUrl when set", async () => {
    const profile = await getProfile("en");
    expect(profile.linkedinUrl).toBe("https://www.linkedin.com/in/test");
    expect(profile.facebookUrl).toBe("https://www.facebook.com/test");
  });

  it("omits linkedinUrl and facebookUrl when not set on the source profile", async () => {
    vi.doMock("@/data/seed", () => ({
      profile: {
        name: "YERRMAK",
        fullName: "Viktor Yermakov",
        tagline: { en: "Tagline", uk: "Тег" },
        biography: { en: "Bio", uk: "Біо" },
        portrait: { url: "/portrait.jpg", alt: "Portrait", width: 1, height: 1 },
        email: "test@example.com",
        instagramUrl: "https://www.instagram.com/test",
        youtubeUrl: "https://www.youtube.com/@test",
      },
      projects: [],
      siteSettings: { showreelUrl: "", contactCtaText: { en: "", uk: "" } },
    }));
    vi.resetModules();
    const { getProfile: getProfileFresh } = await import("@/lib/content/seed-queries");
    const profile = await getProfileFresh("en");
    expect(profile.linkedinUrl).toBeUndefined();
    expect(profile.facebookUrl).toBeUndefined();
  });
});
