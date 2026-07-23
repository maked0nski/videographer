/**
 * Poster-first hero background (constitution Principle IV, FR-001, FR-002):
 * `poster` shows instantly, the clip starts once buffered via plain
 * `autoPlay muted loop playsInline` — no custom preloading logic, per
 * research.md §5. If `hero-loop.mp4` isn't present yet, the video element
 * simply fails to load and the poster keeps showing.
 */
export function HeroVideo() {
  return (
    <video
      className="absolute inset-0 h-full w-full object-cover"
      poster="/hero/hero-poster.jpg"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
    >
      <source src="/hero/hero-loop.mp4" type="video/mp4" />
    </video>
  );
}
