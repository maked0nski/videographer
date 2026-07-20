import { describe, expect, it } from "vitest";
import { toYoutubeNoCookieEmbedUrl } from "@/lib/youtube";

describe("toYoutubeNoCookieEmbedUrl", () => {
  it("extracts the video id from a standard watch URL", () => {
    expect(toYoutubeNoCookieEmbedUrl("https://www.youtube.com/watch?v=abc123")).toBe(
      "https://www.youtube-nocookie.com/embed/abc123?autoplay=1",
    );
  });

  it("extracts the video id from a youtu.be short link", () => {
    expect(toYoutubeNoCookieEmbedUrl("https://youtu.be/abc123")).toBe(
      "https://www.youtube-nocookie.com/embed/abc123?autoplay=1",
    );
  });

  it("returns null for a URL with no recognizable video id", () => {
    expect(toYoutubeNoCookieEmbedUrl("https://example.com/video")).toBeNull();
  });

  it("returns null for an unparseable string", () => {
    expect(toYoutubeNoCookieEmbedUrl("not a url")).toBeNull();
  });
});
