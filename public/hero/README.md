# Hero assets

- `hero-loop.mp4` — real footage supplied by the site owner (48s clip). Not a
  Sanity asset by design (`research.md` §5) — self-hosted here for direct
  Vercel static-asset caching with no CMS cold start on the most
  performance-sensitive asset on the site. Consider trimming it to a shorter
  loop (5-10s) with `ffmpeg` for a snappier repeat and a smaller download once
  the owner has a preferred cut.
- `hero-poster.jpg` — a branded placeholder (logo on the dark background)
  generated from the real logo, standing in until a still frame from the
  actual clip (or a dedicated photo) is grabbed, e.g. via
  `ffmpeg -ss 00:00:02 -i hero-loop.mp4 -frames:v 1 hero-poster.jpg`.

`src/components/home/HeroVideo.tsx` references both paths directly.
