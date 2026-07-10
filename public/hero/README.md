# Hero assets

`hero-poster.svg` is a placeholder. Before launch, replace it and add the real
looping background clip the roadmap calls for:

- `hero-loop.mp4` — short (a few seconds), muted, looping, compressed clip. Not
  a Sanity asset by design (`research.md` §5) — self-hosted here for direct
  Vercel static-asset caching with no CMS cold start on the most
  performance-sensitive asset on the site. Until this file is added, the
  `<video>` element simply fails to load and the poster image keeps showing —
  the same degraded-but-usable behavior as the "connection can't buffer the
  video" edge case in `spec.md`.
- `hero-poster.jpg` (or `.webp`) — a real still frame. If you swap the
  extension, update the `poster` path in `src/components/home/HeroVideo.tsx`
  to match (or keep it `.svg` and just replace the file contents).

`src/components/home/HeroVideo.tsx` references both paths directly.
