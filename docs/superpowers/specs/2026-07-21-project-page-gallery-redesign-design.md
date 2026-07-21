# Project page gallery redesign — Film Stills, Photo Gallery, BTS, Gear

## Context

The project detail page (`/[locale]/work/[slug]`) currently renders a single
`gallery` field with two overloaded meanings: for Video projects it's shown
as "Behind the Scenes" content, for Photo projects it's the primary photo
grid. Both render through `PhotoGallery.tsx` in a fixed `aspect-[4/5]
object-cover` grid, which center-crops every image regardless of its native
aspect ratio.

This redesign splits that single field into three purpose-built sections,
introduces an adaptive layout engine that preserves native aspect ratios
without cropping, and adds camera/lens gear fields. **Scope is limited to the
project detail page** — the homepage hero, "Selected Work"/"Photography"
preview grids, and `ProjectCard` cover-image treatment are unchanged and out
of scope.

## Content model changes (Sanity `project` schema)

Split the current dual-purpose `gallery` field into three fields:

| Field | Type | Applies to | Notes |
|---|---|---|---|
| `filmStills` | array of `image` | Video projects | New. Color-graded stills. No count limit enforced — field description recommends 4–6 but does not validate a max. Empty for all existing projects; owner fills in over time. |
| `behindTheScenes` | array of (`image` \| `btsVideoClip`) | Video projects | Migrated from the old `gallery` (which already served this role for Video projects). Now supports mixed photo/video items in any order. No count limit. |
| `photoGallery` | array of `image` | Photo projects | Migrated from the old `gallery` (which already served this role for Photo projects). No count limit. |

`btsVideoClip` is a named object type: `{ file: file (video/mp4,webm), orientation: "landscape" | "portrait" (default "landscape") }`. The `orientation` field exists because Sanity does not extract width/height metadata for generic `file` assets the way it does for `image` assets (confirmed: existing `previewClip` field already has no known dimensions and renders via `object-cover` in a fixed container — same precedent applies here). Orientation drives which band (portrait vs landscape) the clip clusters into; the clip itself renders `object-cover` within its band slot, matching the existing `previewClip` treatment. This is the one intentional exception to "no cropping," and it only applies to BTS *video* — BTS *photos*, Film Stills, and Photo Gallery are all `image` type with exact metadata and render without any crop.

Two new plain fields on `project` (both types, optional):
- `camera` — `string` (not localized; gear names aren't translated)
- `lenses` — `string` (not localized)

The old `gallery` field is removed after migration (see Migration Plan below).

## Site Settings addition

New field on the `siteSettings` singleton:

- `galleryDefaultDisplayCount` — `number`, default `8`. Controls how many items the clustered grid shows before the remainder moves into the horizontal overflow filmstrip. One global value for the whole site (not per-project). Owner-editable in Studio; ships pre-set to 8 via the same migration script that adds the field (`setIfMissing`, following the pattern already used for the nav/footer/heading text fields).

## Layout engine — `ClusteredStillsGrid`

One shared component renders all three sections (Film Stills, Photo Gallery, BTS) — they differ only in which field feeds it and whether video items are possible.

**Algorithm** (pure function, unit-testable without the DOM):
1. Walk the ordered array of items (as authored in Sanity — no client-side reordering).
2. Classify each item's orientation: images use `height > width` from Sanity's image metadata; BTS video clips use their explicit `orientation` field.
3. Group consecutive same-orientation items into "bands." A portrait band renders as a row of 3–4 columns; a landscape band renders as a row of 1–2 columns. Within a band, the exact column count (e.g. 3 vs 4, 1 vs 2) is chosen to keep the row's cumulative justified width close to the container width — a very wide/cinematic image can fill a landscape band alone, matching standard justified-gallery packing. This packing heuristic is finalized during implementation, not fixed further here.
4. Within a band, lay out a true justified row: fixed row height, each item's width = `rowHeight × itemAspectRatio`. Images use their exact aspect ratio (no crop, no `object-cover`). BTS video clips use a representative aspect ratio for their declared orientation and render `object-cover` in that slot.
5. Because every image's width/height is already known from Sanity metadata (and every video clip's orientation is explicitly authored), this entire computation happens server-side during render — no client JS measurement, no post-load reflow, **no layout shift**.

**Overflow filmstrip:** items beyond `galleryDefaultDisplayCount` (from Site Settings) render in a horizontal, scrollable strip of small thumbnails below the clustered grid instead of continuing the banded layout. Clicking any thumbnail (in the grid or the filmstrip) opens the existing `Lightbox` component at that item's index, so full-size browsing across the *entire* set (not just the visible default) is always available. Film Stills is expected to rarely trigger this (typically 4–6 items against a default of 8), but the mechanism is generic and not size-limited.

## Components

- **New:** `ClusteredStillsGrid` (band-grouping + justified-row layout + overflow filmstrip). Replaces the current `PhotoGallery.tsx` grid rendering (its Lightbox wiring is reused/kept).
- **`ProjectMeta`:** two new optional rows, Camera and Lenses, alongside the existing Year/Location/Role/Producer-Director/Recognition rows — same "omit when absent" pattern already used there.
- **BTS section:** on the project page, renders under its own heading (existing "Behind the Scenes" heading, unchanged) using `ClusteredStillsGrid` fed by `behindTheScenes` instead of `PhotoGallery`.
- **Film Stills section:** new section on Video project pages, own heading, `ClusteredStillsGrid` fed by `filmStills`. Hidden entirely when the field is empty (same "optional block" convention as `aboutVideoUrl` on the About page).
- **Photo Gallery:** Photo project pages use `ClusteredStillsGrid` fed by `photoGallery` in place of the current `PhotoGallery` grid.

## Migration plan

1. Add the three new fields + `camera`/`lenses` + `btsVideoClip` object type to the `project` schema; add `galleryDefaultDisplayCount` to `siteSettings`. Validate with `sanity schema validate`.
2. One-time migration script (same pattern as the `siteSettings` text migration): for every existing `project` document, copy `gallery` → `photoGallery` when `type == "photo"`, or `gallery` → `behindTheScenes` when `type == "video"`; leave `filmStills` empty. Then unset the old `gallery` field. Patch `siteSettings.galleryDefaultDisplayCount` to `8` via `setIfMissing`.
3. Remove `gallery` from the schema only after confirming the migration committed successfully (query-verify, same as done for the site text migration).
4. Revalidation: editing any of `filmStills`/`behindTheScenes`/`photoGallery`/`camera`/`lenses` on a project falls under the existing `project` webhook case in `/api/revalidate` (already revalidates that project's locale paths) — no webhook changes needed. Editing `galleryDefaultDisplayCount` in `siteSettings` needs the whole-subtree `layout`-type revalidation already added for other site-wide fields, since the default count affects every project's grid.

## Testing

- Pure unit tests for the band-grouping algorithm (orientation classification, band boundaries, row width math) — no DOM/rendering required.
- Component test: `ClusteredStillsGrid` renders items beyond the default count into the filmstrip, not the main grid.
- Component test: BTS video clip item renders a `<video muted loop autoPlay playsInline>` with `object-cover`, sized per its declared orientation.
- Migration script gets a dry-run/verify step (query before/after) the same way the site-text migration was manually verified, rather than an automated test (it's a one-time operation against production data).
