import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

const baseProfile = {
  name: "YERRMAK",
  fullName: "Viktor Yermakov",
  tagline: "Cinematographer",
  biography: "A short biography.",
  portrait: { url: "/profile/portrait.jpg", alt: "Portrait", width: 394, height: 525 },
  email: "yerrmakov@gmail.com",
  instagramUrl: "https://www.instagram.com/yerrmak",
  youtubeUrl: "https://www.youtube.com/@yerrmak",
};

const baseSiteSettings = {
  aboutPageHeading: "About & Contact",
  aboutContactHeading: "Get in touch",
};

describe("About & Contact page", () => {
  it("renders icon links for email/Instagram/YouTube and never a form, with LinkedIn/Facebook omitted when not set", async () => {
    vi.doMock("@/lib/content/queries", () => ({
      getProfile: vi.fn().mockResolvedValue(baseProfile),
      getSiteSettings: vi.fn().mockResolvedValue(baseSiteSettings),
    }));
    vi.resetModules();
    const { default: FreshAboutPage } = await import("@/app/[locale]/about/page");
    const element = await FreshAboutPage({ params: Promise.resolve({ locale: "en" }) });
    render(element);

    const emailLink = screen.getByRole("link", { name: /email/i });
    expect(emailLink).toHaveAttribute("href", "mailto:yerrmakov@gmail.com");

    const instagramLink = screen.getByRole("link", { name: /instagram/i });
    expect(instagramLink).toHaveAttribute("href", "https://www.instagram.com/yerrmak");

    const youtubeLink = screen.getByRole("link", { name: /youtube/i });
    expect(youtubeLink).toHaveAttribute("href", "https://www.youtube.com/@yerrmak");

    expect(screen.queryByRole("link", { name: /linkedin/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /facebook/i })).not.toBeInTheDocument();

    expect(screen.getByText("A short biography.")).toBeInTheDocument();
    expect(document.querySelector("form")).not.toBeInTheDocument();
  });

  it("renders LinkedIn and Facebook icon links when those URLs are set", async () => {
    vi.doMock("@/lib/content/queries", () => ({
      getProfile: vi.fn().mockResolvedValue({
        ...baseProfile,
        linkedinUrl: "https://www.linkedin.com/in/yerrmak",
        facebookUrl: "https://www.facebook.com/yerrmak",
      }),
      getSiteSettings: vi.fn().mockResolvedValue(baseSiteSettings),
    }));
    vi.resetModules();
    const { default: FreshAboutPage } = await import("@/app/[locale]/about/page");
    const element = await FreshAboutPage({ params: Promise.resolve({ locale: "en" }) });
    render(element);

    const linkedinLink = screen.getByRole("link", { name: /linkedin/i });
    expect(linkedinLink).toHaveAttribute("href", "https://www.linkedin.com/in/yerrmak");

    const facebookLink = screen.getByRole("link", { name: /facebook/i });
    expect(facebookLink).toHaveAttribute("href", "https://www.facebook.com/yerrmak");
  });

  it("renders no video block when aboutVideoUrl is not set", async () => {
    vi.doMock("@/lib/content/queries", () => ({
      getProfile: vi.fn().mockResolvedValue(baseProfile),
      getSiteSettings: vi.fn().mockResolvedValue(baseSiteSettings),
    }));
    vi.resetModules();
    const { default: FreshAboutPage } = await import("@/app/[locale]/about/page");
    const element = await FreshAboutPage({ params: Promise.resolve({ locale: "en" }) });
    render(element);

    expect(screen.queryByRole("button", { name: /play video/i })).not.toBeInTheDocument();
  });

  it("renders the video presentation player when aboutVideoUrl is set", async () => {
    vi.doMock("@/lib/content/queries", () => ({
      getProfile: vi.fn().mockResolvedValue({
        ...baseProfile,
        aboutVideoUrl: "https://youtu.be/y8wpTiXLE-w",
      }),
      getSiteSettings: vi.fn().mockResolvedValue(baseSiteSettings),
    }));
    vi.resetModules();
    const { default: FreshAboutPage } = await import("@/app/[locale]/about/page");
    const element = await FreshAboutPage({ params: Promise.resolve({ locale: "en" }) });
    render(element);

    expect(screen.getByRole("button", { name: /play video/i })).toBeInTheDocument();
  });
});
