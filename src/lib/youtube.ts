/**
 * Parses a YouTube watch/short-link URL into a youtube-nocookie.com embed
 * URL, or returns null when no video id can be recognized. Shared by
 * `VideoModal` and `HeroVideoPlayer` — the only two places that ever build
 * a YouTube embed src.
 */
export function toYoutubeNoCookieEmbedUrl(youtubeUrl: string): string | null {
  try {
    const url = new URL(youtubeUrl);
    let videoId = url.searchParams.get("v");
    if (!videoId && url.hostname.includes("youtu.be")) {
      videoId = url.pathname.slice(1);
    }
    if (!videoId) return null;
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
  } catch {
    return null;
  }
}
