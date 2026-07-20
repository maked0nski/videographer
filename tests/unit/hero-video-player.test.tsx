import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeroVideoPlayer } from "@/components/media/HeroVideoPlayer";

vi.mock("next/image", () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

const coverImage = { url: "/cover.jpg", alt: "Cover", width: 1600, height: 1000 };

describe("HeroVideoPlayer", () => {
  it("shows the cover image and no iframe before Play is clicked, when there is no preview clip", () => {
    render(
      <HeroVideoPlayer
        youtubeUrl="https://www.youtube.com/watch?v=abc123"
        coverImage={coverImage}
        playLabel="Play video"
      />,
    );

    expect(screen.getByAltText("Cover")).toBeInTheDocument();
    expect(document.querySelector("video")).not.toBeInTheDocument();
    expect(document.querySelector("iframe")).not.toBeInTheDocument();
  });

  it("shows the muted preview clip instead of the cover image when previewClipUrl is set", () => {
    render(
      <HeroVideoPlayer
        youtubeUrl="https://www.youtube.com/watch?v=abc123"
        coverImage={coverImage}
        previewClipUrl="/preview.mp4"
        playLabel="Play video"
      />,
    );

    const video = document.querySelector("video") as HTMLVideoElement;
    expect(video.src).toContain("/preview.mp4");
    expect(video.poster).toContain("/cover.jpg");
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.autoplay).toBe(true);
    expect(document.querySelector("iframe")).not.toBeInTheDocument();
  });

  it("mounts a youtube-nocookie iframe only after Play is clicked", async () => {
    const user = userEvent.setup();
    render(
      <HeroVideoPlayer
        youtubeUrl="https://www.youtube.com/watch?v=abc123"
        coverImage={coverImage}
        playLabel="Play video"
      />,
    );

    expect(document.querySelector("iframe")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /play video/i }));

    const iframe = document.querySelector("iframe");
    expect(iframe).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/abc123?autoplay=1");
  });
});
