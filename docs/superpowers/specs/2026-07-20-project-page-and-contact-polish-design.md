# Design: Video fallback cover, social contact icons, lighter background

Date: 2026-07-20

## 1. Video project cover-image fallback

**Problem**: On a video project's detail page (`src/app/[locale]/work/[slug]/page.tsx`), `<VideoPlayerTrigger>` only renders when `project.youtubeUrl` is truthy. When a video project has no `youtubeUrl` yet (e.g. `youtubeUrl` is left blank per the earlier schema change that downgraded it to a warning), nothing renders in that slot — the page jumps straight from nothing to the meta info block, with no image at all.

**Fix**: When `project.type === "video"` and `project.youtubeUrl` is falsy, render a static fallback in the same slot: the same wrapper (`aspect-video`, `bg-secondary`, full width, same position in the layout) showing `project.coverImage`, but with no play button, no click handler, and no modal. This is a plain `<Image fill>` block, visually consistent with the video poster but clearly non-interactive.

**Scope boundary**: Applies only when `youtubeUrl` is empty. A non-empty but non-YouTube URL (e.g. a pasted Vimeo link) is out of scope — `VideoPlayerTrigger`/`VideoModal` keep behaving as today.

**Files touched**: `src/app/[locale]/work/[slug]/page.tsx` only. No new component needed — the fallback is a small inline JSX block alongside the existing `VideoPlayerTrigger` conditional.

**Not in scope**: Behind-the-scenes photos already work today via the existing `gallery` field on `project` documents (Sanity schema already describes it as "optional behind-the-scenes set for Video projects", and the page already renders a "Behind the Scenes" section from it). The apparent gap in the reported screenshot (The Withshaw Case) is a content gap, not a code gap — that project doesn't have gallery images uploaded in Studio yet. No schema or component change needed for this part.

## 2. Social icons in the "Get in touch" section

**Problem**: The About page's contact section (`src/app/[locale]/about/page.tsx`, `#contact`, heading "Get in touch") renders a vertical text-link list: email, Instagram, YouTube. The desired result is a horizontal row of icons (Instagram, YouTube, LinkedIn, Facebook, and an envelope for email), monochrome to match the site's existing black/white/accent aesthetic (no per-platform brand colors), with hover transitioning to the accent yellow — consistent with every other hover state on the site.

**Schema change** (`sanity/schemaTypes/profile.ts`): add two new optional `url` fields, `linkedinUrl` and `facebookUrl`, alongside the existing (required) `instagramUrl`/`youtubeUrl`. Optional because not every visit to Studio will have both filled in immediately, and the icon row should tolerate that (see rendering rule below) rather than blocking publish.

**Type change** (`src/types/profile.ts`): add `linkedinUrl?: string; facebookUrl?: string;` to both `Profile` and `ResolvedProfile`.

**Data plumbing**: update the GROQ projection in `src/lib/sanity/queries.ts` and the seed fallback in `src/data/seed.ts` (and `src/lib/content/seed-queries.ts` if it maps fields separately) so the two new optional fields flow through to the resolved profile the About page consumes.

**Rendering rule**: a row of `<a>` icon links. Email is always shown (the field is `required()` in Sanity already) as a `mailto:` envelope icon. Instagram/YouTube are always shown (also required today). LinkedIn/Facebook render conditionally — only when their URL is non-empty — since those fields are optional.

**Visual style**: reuse the existing hover pattern already used throughout the site (`text-secondary` → `hover:text-accent transition-colors`), sized as small inline SVGs (`h-5 w-5` or similar, `viewBox="0 0 24 24"`, `fill="currentColor"`), each wrapped in a `<VisuallyHidden>` label for accessibility (reusing/extending the existing `t.about.email`/`instagram`/`youtube` message keys, adding `linkedin`/`facebook` keys to `src/messages/en.json` and `uk.json`).

**Files touched**: `sanity/schemaTypes/profile.ts`, `src/types/profile.ts`, `src/lib/sanity/queries.ts`, `src/data/seed.ts` (+ `seed-queries.ts` if applicable), `src/app/[locale]/about/page.tsx` (replace the `<ul>` list with the new icon row), `src/messages/en.json`, `src/messages/uk.json`. No new dependency — icons are inline SVGs, matching the existing pattern already used for the video play icon in `VideoPlayerTrigger`.

**Not in scope**: no icon row is added anywhere else (footer, homepage) — only the About page's `#contact` section, matching where "Get in touch" actually appears in the UI today (the homepage's "Get in touch" is a button linking to this same section, not a second icon row).

## 3. Lighter background

**Problem**: The site background reads as near-pure-black; the user wants it perceptibly lighter.

**Fix**: in `src/styles/globals.css`, the single source of truth for color (constitution Principle III):
- `--color-bg`: `#050505` → `#222222`
- `--color-bg-secondary`: `#0c0c0c` → `#2a2a2a`

Both tokens move together so the existing hierarchy is preserved (`bg-secondary` stays slightly lighter than `bg`, used for image placeholders/cards sitting on top of the main background). No component changes — every consumer already reads these two CSS variables, never a raw hex value.

## Out of scope for this change

- Non-YouTube video embedding (Vimeo etc.) — flagged previously, not requested here.
- Revoking `SANITY_MIGRATION_TOKEN` — unrelated hygiene item, flagged separately, not part of this work.
