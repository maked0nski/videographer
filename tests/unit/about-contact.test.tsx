import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage from "@/app/[locale]/about/page";

vi.mock("next/image", () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

vi.mock("@/lib/content/queries", () => ({
  getProfile: vi.fn().mockResolvedValue({
    name: "YERRMAK",
    fullName: "Viktor Yermakov",
    tagline: "Cinematographer",
    biography: "A short biography.",
    portrait: { url: "/profile/portrait.svg", alt: "Portrait", width: 1200, height: 1500 },
    email: "yerrmakov@gmail.com",
    instagramUrl: "https://www.instagram.com/yerrmak",
    youtubeUrl: "https://www.youtube.com/@yerrmak",
  }),
}));

describe("About & Contact page", () => {
  it("renders mailto/Instagram/YouTube links from Profile data and never a form", async () => {
    const element = await AboutPage({ params: Promise.resolve({ locale: "en" }) });
    render(element);

    const emailLink = screen.getByRole("link", { name: /yerrmakov@gmail.com/i });
    expect(emailLink).toHaveAttribute("href", "mailto:yerrmakov@gmail.com");

    const instagramLink = screen.getByRole("link", { name: /instagram/i });
    expect(instagramLink).toHaveAttribute("href", "https://www.instagram.com/yerrmak");

    const youtubeLink = screen.getByRole("link", { name: /youtube/i });
    expect(youtubeLink).toHaveAttribute("href", "https://www.youtube.com/@yerrmak");

    expect(screen.getByText("A short biography.")).toBeInTheDocument();
    expect(document.querySelector("form")).not.toBeInTheDocument();
  });
});
