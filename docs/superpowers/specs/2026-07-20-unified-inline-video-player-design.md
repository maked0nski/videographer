# Design: Unified inline video player (Cycle 1 of the project-page redesign)

Date: 2026-07-20

This is the first of two planned cycles toward a broader project-detail-page
redesign (Technical Specs, Stills gallery, two-column meta layout, and a
redesigned prev/next nav are Cycle 2, specced separately later). This cycle
replaces the project page's static poster-and-modal video flow with a
seamless inline player: a muted looping preview (when available) that
morphs in place into a full YouTube player with sound and controls on
click — no dialog, no page jump.

## Why this cycle goes first

The hero video block is the dominant element on a cinematographer's project
page. Its container geometry and playback state machine constrain
everything rendered below it. Building the two-column meta block and Stills
gallery against a not-yet-final hero would risk reflow/rework once the
player's real behavior lands. This cycle is deliberately built and tested
in isolation — a fixed-`aspect-video` container with placeholder content
below it stands in for the not-yet-built Cycle 2 layout.

## Scope boundary

- Applies only to the project detail page's hero slot for `type === "video"`
  projects that have a `youtubeUrl` set. The existing "no `youtubeUrl` at
  all" fallback (static cover image, no Play button, shipped in the prior
  cycle) is untouched.
- `VideoModal` (the full-screen dialog) is **not** deleted. It stays exactly
  as-is for `ShowreelButton.tsx` on the homepage — a floating CTA button
  with no in-place video slot to morph into, where a dialog is the correct
  pattern. Only the project page's video slot stops using it.
- No vertical/aspect-ratio-mismatch handling — every project today is 16:9;
  deferred as YAGNI until a real project needs it.
- No JS-based autoplay detection (`.play().then/catch`). The Play-button
  overlay is visually identical whether the muted loop is actually playing
  or blocked by the browser — so the native `<video autoPlay muted loop
  playsInline poster>` fallback (poster shows automatically when autoplay is
  blocked) gives the same result with zero custom code, matching the
  existing convention already established in `src/components/home/HeroVideo.tsx`.

## Data model

**Sanity schema** (`sanity/schemaTypes/project.ts`): add one new optional
field, `previewClip`:

```ts
defineField({
  name: "previewClip",
  title: "Preview clip (muted loop)",
  type: "file",
  options: { accept: "video/mp4,video/webm" },
  description:
    "Optional — a short (3–5s), heavily compressed, silent loop shown before the visitor clicks Play. Falls back to the cover image when not set. Video projects only.",
  hidden: ({ document }) => document?.type !== "video",
}),
```

No `validation: required()` — most projects won't have this uploaded yet;
absence is a normal, fully-supported state (falls back to the cover image,
exactly like today).

**Types** (`src/types/project.ts`): add `previewClipUrl?: string` to both
`Project` and `ResolvedProject`.

**Query threading**: both implementations gain the field —
`src/lib/content/seed-queries.ts` reads it from the seed `Project` (which
won't set it — no real clips exist yet, so it resolves to `undefined` and
every seed project uses the cover-image fallback, which is correct), and
`src/lib/sanity/queries.ts` adds `"previewClipUrl": previewClip.asset->url`
to `PROJECT_FULL_PROJECTION` and threads it through `getProjectBySlug`.

## Component architecture

**New file**: `src/components/media/HeroVideoPlayer.tsx` — replaces
`VideoPlayerTrigger.tsx` as the thing `work/[slug]/page.tsx` renders for a
video project that has a `youtubeUrl`. `VideoPlayerTrigger.tsx` and its
import of `VideoModal` are deleted (superseded); `VideoModal.tsx` itself is
untouched (still imported by `ShowreelButton.tsx`).

**Shared utility**: `toYoutubeNoCookieEmbedUrl` (currently private to
`VideoModal.tsx`) moves to `src/lib/youtube.ts`, unchanged in behavior.
Both `VideoModal.tsx` and `HeroVideoPlayer.tsx` import it from there — one
parser, not two.

**State**: a single boolean is enough — `isActive` (`false` until clicked,
`true` after). There is no third loading/detection state; whichever preview
element the browser actually renders (playing loop or paused-on-poster) is
invisible to the component's own state, exactly per the scope boundary
above.

**Structure** (all layers stacked in one `relative aspect-video` container,
matching the existing wrapper classes already used by `VideoPlayerTrigger`):

1. **Preview layer** (bottom-most while inactive): if `previewClipUrl` is
   set, a plain `<video src={previewClipUrl} poster={coverImage.url}
   autoPlay muted loop playsInline>`; otherwise a plain `<Image
   src={coverImage.url} fill />` (same as today's poster). Either way, this
   layer is not conditionally unmounted when `isActive` becomes true — see
   "Avoiding a black flash" below.
2. **Overlay** (Play button + a small `aria-hidden` muted-speaker glyph,
   both wrapped so they fade with the preview layer): visible only while
   `!isActive`. Clicking anywhere on the preview layer or the Play button
   sets `isActive = true`. Reuses the existing `VisuallyHidden` + `svg
   aria-hidden` icon-button pattern already used by `CloseButton.tsx` and
   the current `VideoPlayerTrigger.tsx`.
3. **Active layer** (top-most once active): only mounted once `isActive` is
   `true` — a lazily-created `<iframe src={toYoutubeNoCookieEmbedUrl(youtubeUrl) + '&autoplay=1'} allowFullScreen>`,
   exactly like the current modal's iframe (same `allow` attribute, same
   `youtube-nocookie.com` origin, same "no request before the click"
   guarantee — FR-003/FR-004/FR-014 continue to hold, just without the
   dialog wrapper).

**Transition (click → active), and avoiding a black flash**: the preview
layer (video or image + overlay) is never removed from the DOM on
activation — it is hidden with `opacity-0 pointer-events-none` via a CSS
transition (e.g. `transition-opacity duration-300`), while the iframe layer
simultaneously transitions from `opacity-0` to `opacity-100`. Because the
iframe needs a brief moment to initialize and paint its first frame, the
still-visible (fading, not gone) preview layer underneath prevents any bare
background from flashing through during that gap — a `visibility`/`z-index`
choice, not a load-event race. Once the preview `<video>` element's opacity
reaches 0, call `.pause()` on it (a simple `onTransitionEnd` handler) so it
stops consuming CPU/battery in the background — it stays in the DOM,
paused, not removed.

**Props**: `HeroVideoPlayer({ youtubeUrl, coverImage, previewClipUrl, playLabel })` —
no `closeLabel`/`onClose` (no modal to close), no `poster` prop rename needed
(`coverImage` is already the name used elsewhere in this file's tree).

## Page wiring

`src/app/[locale]/work/[slug]/page.tsx`: replace the `VideoPlayerTrigger`
import and its usage with `HeroVideoPlayer`, passing `previewClipUrl` from
`project.previewClipUrl`. The sibling branch for `type === "video" &&
!youtubeUrl` (the static-only fallback from the prior cycle) is untouched.

## Test changes

- `tests/unit/project-video-fallback.test.tsx` (from the prior cycle):
  unaffected — its "youtubeUrl present" assertion only checks for a `Play
  video` button, which `HeroVideoPlayer` still renders identically; its
  "youtubeUrl absent" assertion is about the untouched sibling branch.
- `tests/e2e/video-modal.spec.ts` splits in two:
  - The showreel-button test (homepage, `VideoModal`) is unchanged, moved
    as-is into a renamed `tests/e2e/showreel-modal.spec.ts` (the old
    filename no longer matches what's left in it).
  - The project-page test is rewritten: it must still assert that no
    `youtube-nocookie.com` request fires before the click, and that a
    request fires after clicking "Play video" — but instead of asserting a
    `role=dialog` appears, it asserts an `iframe[src*="youtube-nocookie.com"]`
    is present directly on the page (no dialog role at all).

## Studio content-authoring descriptions

Separately from the video player work, add short `description` text to
every Sanity Studio field across all three schemas that currently lacks one,
so the site owner always knows what a field does and when to fill it in
without leaving Studio. This is a pure documentation/content-authoring
change — no field types, validation, or data shapes change.

**`sanity/schemaTypes/project.ts`**:
- `type`: "Drives which fields below apply and how this project displays across the site (Video vs Photo) — pick this first."
- `title`: "Shown as the page heading and in Work list cards. Fill in at least one language; the other language falls back to whichever one is filled."
- `coverImage`: "The main thumbnail — used on Work list cards, homepage previews, and as the poster before a video is played."
- `description`: "A short paragraph shown under the title on the project's own page. Keep it to 1–3 sentences."
- `featured`: "Shows this project in the homepage's Selected Work section. Turn off for projects you only want listed on the Work page."

**`sanity/schemaTypes/profile.ts`**:
- `name`: "Short brand name shown in the site header and footer (e.g. \"YERRMAK\")."
- `fullName`: "Full name, shown on the About page and used as the portrait's alt text."
- `tagline`: "One-line description shown under the name on the homepage/About page."
- `biography`: "The paragraph shown on the About page, next to the portrait."
- `portrait`: "Photo shown on the About page next to the biography."
- `email`: "Shown as a clickable mail icon in the \"Get in touch\" section — this site has no contact form."
- `instagramUrl`: "Full profile URL (e.g. https://www.instagram.com/yerrmak/) — shown as an icon in \"Get in touch\"."
- `youtubeUrl`: "Full channel URL — shown as an icon in \"Get in touch\". This is your channel, not a specific project's video link."

**`sanity/schemaTypes/siteSettings.ts`**:
- `contactCtaText`: "Heading shown above the \"Get in touch\" button on the homepage (e.g. \"Let's create something\")."

## Out of scope for this cycle

- Technical Specs (camera/lens), Stills gallery, two-column meta layout,
  prev/next nav redesign — Cycle 2, specced separately.
- Aspect-ratio-mismatch modal fallback — YAGNI, revisit if a real vertical
  project ever needs it.
- JS-based autoplay success/failure detection — native `<video>` fallback
  behavior already covers the visible requirement with no custom code.
