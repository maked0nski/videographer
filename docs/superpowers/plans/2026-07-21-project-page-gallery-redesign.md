# Project Page Gallery Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the project detail page's single-purpose `gallery` field with three purpose-built sections (Film Stills, Behind the Scenes, Photo Gallery) rendered through a shared justified/banded grid that preserves native aspect ratios without cropping, plus Camera/Lenses gear fields.

**Architecture:** Split Sanity's `project.gallery` into `filmStills` (video, images only), `behindTheScenes` (video, mixed image/video), `photoGallery` (photo, images only). A new pure function (`groupIntoRows`) classifies items by orientation and groups them into justified rows (portrait: 1-4 cols, landscape: 1-2 cols); a new `ClusteredStillsGrid` component renders those rows via CSS flexbox (`flex-grow` proportional to aspect ratio — no JS measurement, no layout shift) and moves anything past a site-wide default count into a horizontal overflow filmstrip that opens the existing `Lightbox`. Full design rationale: `docs/superpowers/specs/2026-07-21-project-page-gallery-redesign-design.md`.

**Tech Stack:** Next.js App Router, Sanity (schema + GROQ), TypeScript, Tailwind, Vitest + Testing Library, Playwright.

## Global Constraints

- Scope is the project detail page (`/[locale]/work/[slug]`) only. Do not touch the homepage, Work list, or `ProjectCard`.
- No count limits (min/max validation) on `filmStills`, `behindTheScenes`, or `photoGallery` arrays in Sanity — field descriptions may recommend a range but must not enforce one.
- `galleryDefaultDisplayCount` is one global `siteSettings` value (not per-project).
- Never add a `Co-Authored-By: Claude` trailer to any commit in this repo — commit as the repo's own author only.
- This is a Windows machine; the Bash tool here runs Git Bash (POSIX paths like `/d/projects/videographer`), not PowerShell.
- `.env.local` already has `NEXT_PUBLIC_SANITY_PROJECT_ID` set, so the site always reads from live Sanity in dev — `src/data/seed.ts` is a fallback path exercised only by unit tests and by explicitly unsetting that env var, not by `npm run dev` as normally run in this repo.
- Every one-time migration script against production Sanity data must be deleted immediately after it runs successfully and is verified (do not commit it) — follow the pattern already used in this repo's git history for `siteSettings` text migrations.
- `SANITY_MIGRATION_TOKEN` in `.env.local` may be missing or revoked (it's a one-time-use token by convention). If a migration step 401s with "Unauthorized"/"Session not found", stop and ask the user to create a fresh token at sanity.io/manage → project → API → Tokens → Add API token (Editor/Write permission) and add it to `.env.local`, rather than guessing at a workaround.
- Run `npm run typecheck`, `npx eslint src sanity tests`, and `npx vitest run` before every commit that touches source files; all three must be clean.

---

### Task 1: Fix missing image dimension metadata in Sanity GROQ queries

Sanity does not expand `image.asset` beyond `{_ref, _type}` unless the query explicitly dereferences it with `asset->`. None of the current queries do this, so `toImageAsset()` (`src/lib/sanity/image.ts:19`) always falls back to its hardcoded `{width: 1600, height: 1000}` default — every image on the live site currently reports the same fake aspect ratio. This has had zero visible effect so far because every `<Image>` usage in the codebase uses `fill` + a fixed CSS aspect-ratio container (which ignores the `width`/`height` props). It becomes load-bearing the moment `ClusteredStillsGrid` (Task 6) needs to classify real image orientation — fix it first, independently, so later tasks can build on trustworthy data.

**Files:**
- Modify: `src/lib/sanity/queries.ts`

**Interfaces:**
- Produces: every `ImageAsset` returned by `getAllProjects`, `getProjectBySlug`, `getAdjacentProjects`, and `getProfile` now carries the real per-image `width`/`height` from Sanity, not the `1600x1000` fallback.

- [ ] **Step 1: Fix `PROJECT_LIST_PROJECTION`'s `coverImage` field**

In `src/lib/sanity/queries.ts`, find:

```ts
const PROJECT_LIST_PROJECTION = `{
  "slug": slug.current,
  type,
  title,
  year,
  coverImage,
  featured
}`;
```

Replace with:

```ts
const PROJECT_LIST_PROJECTION = `{
  "slug": slug.current,
  type,
  title,
  year,
  coverImage{..., asset->{_id, metadata{dimensions}}},
  featured
}`;
```

- [ ] **Step 2: Fix `PROJECT_FULL_PROJECTION`'s `coverImage` field**

Find (inside `PROJECT_FULL_PROJECTION`):

```ts
  description,
  coverImage,
  youtubeUrl,
```

Replace with:

```ts
  description,
  coverImage{..., asset->{_id, metadata{dimensions}}},
  youtubeUrl,
```

- [ ] **Step 3: Fix `getAdjacentProjects`'s inline projection**

Find:

```ts
    `*[_type == "project" && published == true] | order(order asc) { "slug": slug.current, title, coverImage, order }`,
```

Replace with:

```ts
    `*[_type == "project" && published == true] | order(order asc) { "slug": slug.current, title, coverImage{..., asset->{_id, metadata{dimensions}}}, order }`,
```

- [ ] **Step 4: Fix `getProfile`'s query**

Find:

```ts
export async function getProfile(locale: Locale): Promise<ResolvedProfile> {
  const doc = await sanityClient.fetch<SanityProfileDoc>(`*[_id == "profile"][0]`);
```

Replace with:

```ts
export async function getProfile(locale: Locale): Promise<ResolvedProfile> {
  // `asset->` dereference is required to get real width/height — a bare
  // image field only returns {_ref, _type} (see queries.ts PROJECT_*_PROJECTION).
  const doc = await sanityClient.fetch<SanityProfileDoc>(
    `*[_id == "profile"][0]{..., portrait{..., asset->{_id, metadata{dimensions}}}}`,
  );
```

- [ ] **Step 5: Verify against live production data**

Run:

```bash
curl -sG "https://u7x92ycv.api.sanity.io/v2026-01-01/data/query/production" --data-urlencode 'query=*[_type=="project" && slug.current=="the-withshaw-case"][0]{coverImage{..., asset->{_id, metadata{dimensions}}}}'
```

Expected: the result includes `"metadata":{"dimensions":{"width":1551,"height":1081,...}}` (or similar real numbers) — not absent, not a placeholder.

- [ ] **Step 6: Type-check and run existing tests**

```bash
npm run typecheck
npx vitest run
```

Expected: both clean (this change doesn't alter any type shape, only the GROQ query strings, so nothing should break).

- [ ] **Step 7: Commit**

```bash
git add src/lib/sanity/queries.ts
git commit -m "fix: dereference image asset metadata so real dimensions reach the app

Every image field was queried without asset-> expansion, so
toImageAsset() silently fell back to a hardcoded 1600x1000 for every
image on the site. Harmless today (every <Image> uses fill mode, which
ignores width/height), but blocking for the upcoming aspect-ratio-aware
gallery grid."
```

---

### Task 2: Sanity schema — split gallery fields, add gear fields, add site settings

**Files:**
- Create: `sanity/schemaTypes/objects/btsVideoClip.ts`
- Modify: `sanity/schemaTypes/index.ts`
- Modify: `sanity/schemaTypes/project.ts`
- Modify: `sanity/schemaTypes/siteSettings.ts`

**Interfaces:**
- Produces: Sanity document fields `project.filmStills`, `project.behindTheScenes`, `project.photoGallery`, `project.camera`, `project.lenses`; object type `btsVideoClip` with fields `file` (video) and `orientation` (`"landscape" | "portrait"`); `siteSettings.galleryDefaultDisplayCount` (number), `siteSettings.filmStillsHeading`, `siteSettings.cameraFieldLabel`, `siteSettings.lensesFieldLabel` (all `localeString`).

- [ ] **Step 1: Create the `btsVideoClip` object type**

Create `sanity/schemaTypes/objects/btsVideoClip.ts`:

```ts
import { defineField, defineType } from "sanity";

/**
 * Sanity doesn't extract width/height for generic `file` assets the way it
 * does for `image` assets — `orientation` is how the editor tells the
 * ClusteredStillsGrid layout engine which row this clip belongs in.
 */
export const btsVideoClip = defineType({
  name: "btsVideoClip",
  title: "BTS video clip",
  type: "object",
  fields: [
    defineField({
      name: "file",
      title: "Video file",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "orientation",
      title: "Orientation",
      type: "string",
      options: {
        list: [
          { title: "Landscape", value: "landscape" },
          { title: "Portrait", value: "portrait" },
        ],
        layout: "radio",
      },
      initialValue: "landscape",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { orientation: "orientation" },
    prepare({ orientation }: { orientation?: string }) {
      return { title: `BTS video clip (${orientation ?? "landscape"})` };
    },
  },
});
```

- [ ] **Step 2: Register the new object type**

In `sanity/schemaTypes/index.ts`, replace the file with:

```ts
import type { SchemaTypeDefinition } from "sanity";
import { localeString } from "./objects/localeString";
import { localeText } from "./objects/localeText";
import { btsVideoClip } from "./objects/btsVideoClip";
import project from "./project";
import profile from "./profile";
import siteSettings from "./siteSettings";

export const schemaTypes: SchemaTypeDefinition[] = [
  localeString,
  localeText,
  btsVideoClip,
  project,
  profile,
  siteSettings,
];
```

- [ ] **Step 3: Replace the `project` schema's gallery field with three typed fields + gear fields**

In `sanity/schemaTypes/project.ts`, find the `role` field and the block from `producerDirector` through the old `gallery` field (i.e. from `defineField({ name: "role", ...` down through the closing of the `gallery` field, just before `defineField({ name: "order", ...`). Replace the whole `role` → `gallery` span with:

```ts
    defineField({
      name: "role",
      title: "Role",
      type: "localeString",
      description: 'e.g. "Director of Photography".',
    }),
    defineField({
      name: "camera",
      title: "Camera",
      type: "string",
      description: 'e.g. "ARRI Alexa Mini" or "RED V-Raptor". Optional.',
    }),
    defineField({
      name: "lenses",
      title: "Lenses",
      type: "string",
      description: 'e.g. "Cooke Anamorphic/i SF". Optional.',
    }),
    defineField({
      name: "producerDirector",
      title: "Producer / Director",
      type: "localeString",
      description: "Optional credit line.",
    }),
    defineField({
      name: "recognition",
      title: "Recognition / stats",
      type: "localeString",
      description: "Optional free-text note — festival selection, view count, etc.",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "localeText",
      description: "A short paragraph shown under the title on the project's own page. Keep it to 1–3 sentences.",
    }),
    defineField({
      name: "youtubeUrl",
      title: "YouTube URL",
      type: "url",
      description: "e.g. https://youtube.com/watch?v=... — required for Video projects.",
      hidden: ({ document }) => document?.type !== "video",
      validation: (rule) =>
        rule
          .custom((value, context) => {
            const doc = context.document as { type?: string } | undefined;
            if (doc?.type === "video" && !value) {
              return "No YouTube link yet — fine to publish, but the video player won't show on the live page until this is filled in.";
            }
            return true;
          })
          .warning(),
    }),
    defineField({
      name: "previewClip",
      title: "Preview clip (muted loop)",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
      description:
        "Optional — a short (3–5s), heavily compressed, silent loop shown before the visitor clicks Play. Falls back to the cover image when not set. Video projects only.",
      hidden: ({ document }) => document?.type !== "video",
    }),
    defineField({
      name: "filmStills",
      title: "Film Stills Gallery",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", title: "Alt text", type: "string" }],
        },
      ],
      description:
        "Color-graded highlight stills from the finished film. No hard limit, but 4–6 is the recommended range. Video projects only.",
      hidden: ({ document }) => document?.type !== "video",
    }),
    defineField({
      name: "behindTheScenes",
      title: "Behind the Scenes",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", title: "Alt text", type: "string" }],
        },
        { type: "btsVideoClip" },
      ],
      description:
        "Production stills and/or short looping video clips documenting the process on set — mix them in any order. Video projects only.",
      hidden: ({ document }) => document?.type !== "video",
    }),
    defineField({
      name: "photoGallery",
      title: "Photo Gallery",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", title: "Alt text", type: "string" }],
        },
      ],
      description: "Full-resolution photos for this photography project.",
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as { type?: string } | undefined;
          if (doc?.type === "photo" && (!value || value.length === 0)) {
            return "Photo projects need at least one gallery image";
          }
          return true;
        }),
      hidden: ({ document }) => document?.type !== "photo",
    }),
```

This removes the old `gallery` field entirely and keeps every other field (`producerDirector` through `previewClip`) unchanged in content, just relocated around the three new fields and `camera`/`lenses`.

- [ ] **Step 4: Add the new `siteSettings` fields**

In `sanity/schemaTypes/siteSettings.ts`, add `"gallery"` to the `groups` array:

```ts
  groups: [
    { name: "general", title: "General", default: true },
    { name: "navigation", title: "Navigation & footer" },
    { name: "homepage", title: "Homepage" },
    { name: "work", title: "Work page" },
    { name: "project", title: "Project page" },
    { name: "about", title: "About page" },
    { name: "gallery", title: "Galleries" },
  ],
```

Then add these fields to the `fields` array (grouping `filmStillsHeading`, `cameraFieldLabel`, `lensesFieldLabel` with `group: "project"`, next to the existing `recognitionFieldLabel` field):

```ts
    defineField({
      name: "filmStillsHeading",
      title: "\"Film Stills\" section heading",
      type: "localeString",
      group: "project",
    }),
    defineField({
      name: "cameraFieldLabel",
      title: "\"Camera\" field label",
      type: "localeString",
      group: "project",
    }),
    defineField({
      name: "lensesFieldLabel",
      title: "\"Lenses\" field label",
      type: "localeString",
      group: "project",
    }),
    defineField({
      name: "galleryDefaultDisplayCount",
      title: "Default gallery display count",
      type: "number",
      description:
        "How many items the Film Stills / Photo Gallery / Behind the Scenes grid shows before the rest move into the scrollable filmstrip below it.",
      initialValue: 8,
      validation: (rule) => rule.required().integer().min(1),
      group: "gallery",
    }),
```

- [ ] **Step 5: Validate the schema**

```bash
cd sanity && npx sanity schema validate
```

Expected: `✔ Validated schema`, `0 errors`, `0 warnings`. If it fails, read the error — it will name the exact field/file.

- [ ] **Step 6: Commit**

```bash
cd /d/projects/videographer
git add sanity/schemaTypes/
git commit -m "feat: split project gallery into Film Stills / BTS / Photo Gallery in Sanity schema

Adds camera/lenses gear fields and a site-wide gallery display-count
setting. No content migrated yet — that's the next task."
```

---

### Task 3: One-time production data migration

This patches live Sanity content: moves each project's old `gallery` array into `photoGallery` (photo projects) or `behindTheScenes` (video projects), and seeds the new `siteSettings` fields.

**Files:**
- Create (temporary, delete after use, never commit): `scripts-tmp-migrate-gallery-split.mjs`

- [ ] **Step 1: Confirm a valid write token is available**

```bash
grep SANITY_MIGRATION_TOKEN .env.local
```

If it's empty or you're unsure it's still valid, stop and ask the user to create one at sanity.io/manage → project → API → Tokens → Add API token (Editor/Write permission) and paste it into `.env.local` as `SANITY_MIGRATION_TOKEN=...` before continuing.

- [ ] **Step 2: Write the migration script**

Create `scripts-tmp-migrate-gallery-split.mjs` at the repo root:

```js
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx), line.slice(idx + 1)];
    }),
);

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: env.SANITY_MIGRATION_TOKEN,
  useCdn: false,
});

const projectsWithGallery = await client.fetch(
  '*[_type == "project" && defined(gallery)]{_id, type, gallery}',
);

for (const project of projectsWithGallery) {
  const targetField = project.type === "photo" ? "photoGallery" : "behindTheScenes";
  await client
    .patch(project._id)
    .set({ [targetField]: project.gallery })
    .unset(["gallery"])
    .commit();
  console.log(`Migrated ${project._id}: gallery -> ${targetField} (${project.gallery.length} items)`);
}

await client
  .patch("siteSettings")
  .setIfMissing({
    galleryDefaultDisplayCount: 8,
    filmStillsHeading: { en: "Film Stills", uk: "Кадри фільму" },
    cameraFieldLabel: { en: "Camera", uk: "Камера" },
    lensesFieldLabel: { en: "Lenses", uk: "Об'єктиви" },
  })
  .commit();

console.log("Patched siteSettings with gallery defaults and new field labels.");
```

- [ ] **Step 3: Run it**

```bash
node scripts-tmp-migrate-gallery-split.mjs
```

Expected output: one `Migrated <id>: gallery -> <field> (N items)` line per project that had a `gallery` field, then `Patched siteSettings with gallery defaults and new field labels.`

- [ ] **Step 4: Verify against production**

```bash
curl -sG "https://u7x92ycv.api.sanity.io/v2026-01-01/data/query/production" --data-urlencode 'query=*[_type=="project"]{"slug":slug.current, type, "hasOldGallery": defined(gallery), "photoGalleryCount": count(photoGallery), "btsCount": count(behindTheScenes)}'
```

Expected: `"hasOldGallery": false` for every project; `the-withshaw-case` and `yara-steel` show `"btsCount": 2`; `scales-photoshoot` shows `"photoGalleryCount": 10`.

```bash
curl -sG "https://u7x92ycv.api.sanity.io/v2026-01-01/data/query/production" --data-urlencode 'query=*[_id=="siteSettings"][0]{galleryDefaultDisplayCount, filmStillsHeading, cameraFieldLabel, lensesFieldLabel}'
```

Expected: `galleryDefaultDisplayCount: 8` and the three new `localeString` fields populated with the values from Step 2.

- [ ] **Step 5: Delete the migration script and remind about the token**

```bash
rm scripts-tmp-migrate-gallery-split.mjs
```

Tell the user the migration ran successfully and, if they added a fresh `SANITY_MIGRATION_TOKEN` for this task, they should revoke it now at sanity.io/manage (same one-time-token convention as before).

No commit here — nothing in the working tree changed (the script was never staged, and it's now deleted).

---

### Task 4: TypeScript types for the new content shapes

**Files:**
- Create: `src/types/gallery.ts`
- Modify: `src/types/index.ts`
- Modify: `src/types/project.ts`
- Modify: `src/types/site-settings.ts`

**Interfaces:**
- Produces: `StillItem` (discriminated union: `{kind:"image"; image: ImageAsset}` or `{kind:"video"; url: string; orientation: "landscape"|"portrait"}`), `StillOrientation`. `Project`/`ResolvedProject` gain `filmStills?: ImageAsset[]`, `behindTheScenes?: StillItem[]`, `photoGallery?: ImageAsset[]`, `camera?: string`, `lenses?: string` (replacing `gallery?: ImageAsset[]`). `SiteSettings`/`ResolvedSiteSettings` gain `galleryDefaultDisplayCount: number`, `filmStillsHeading`, `cameraFieldLabel`, `lensesFieldLabel`.
- Consumes: `ImageAsset` from `./image` (unchanged).

Note: after this task, `npm run typecheck` will show errors in `src/lib/sanity/queries.ts`, `src/lib/content/seed-queries.ts`, and `src/data/seed.ts` (they still reference the now-removed `gallery` field/type) — that's expected and gets fixed in Task 8. Don't try to fix it here.

- [ ] **Step 1: Create the gallery item type**

Create `src/types/gallery.ts`:

```ts
import type { ImageAsset } from "./image";

export type StillOrientation = "landscape" | "portrait";

/**
 * A Behind the Scenes item is either a plain photo or a short looping video
 * clip. Sanity doesn't extract width/height for video files the way it does
 * for images, so video items carry an explicit orientation instead of a
 * measured aspect ratio (see docs/superpowers/specs/2026-07-21-project-page-gallery-redesign-design.md).
 */
export type StillItem =
  | { kind: "image"; image: ImageAsset }
  | { kind: "video"; url: string; orientation: StillOrientation };
```

- [ ] **Step 2: Export it from the types barrel**

In `src/types/index.ts`, add:

```ts
export * from "./gallery";
```

(anywhere in the existing list of `export * from ...` lines).

- [ ] **Step 3: Update the `Project` and `ResolvedProject` interfaces**

In `src/types/project.ts`, add the import:

```ts
import type { StillItem } from "./gallery";
```

In `interface Project`, replace:

```ts
  /** Behind-the-scenes set for video projects; primary gallery for photo projects. */
  gallery?: ImageAsset[];
```

with:

```ts
  /** Color-graded highlight stills; video projects only. */
  filmStills?: ImageAsset[];
  /** Mixed photos/looping clips documenting the shoot; video projects only. */
  behindTheScenes?: StillItem[];
  /** Primary gallery; photo projects only. */
  photoGallery?: ImageAsset[];
  camera?: string;
  lenses?: string;
```

In `interface ResolvedProject`, replace:

```ts
  gallery?: ImageAsset[];
```

with:

```ts
  filmStills?: ImageAsset[];
  behindTheScenes?: StillItem[];
  photoGallery?: ImageAsset[];
  camera?: string;
  lenses?: string;
```

- [ ] **Step 4: Update the `SiteSettings` and `ResolvedSiteSettings` interfaces**

In `src/types/site-settings.ts`, add to `interface SiteSettings` (after `aboutContactHeading`):

```ts
  filmStillsHeading: Localized<string>;
  cameraFieldLabel: Localized<string>;
  lensesFieldLabel: Localized<string>;
  galleryDefaultDisplayCount: number;
```

Add to `interface ResolvedSiteSettings` (after `aboutContactHeading`):

```ts
  filmStillsHeading: string;
  cameraFieldLabel: string;
  lensesFieldLabel: string;
  galleryDefaultDisplayCount: number;
```

- [ ] **Step 5: Confirm the expected (partial) typecheck failure**

```bash
npm run typecheck
```

Expected: errors only in `src/lib/sanity/queries.ts`, `src/lib/content/seed-queries.ts`, `src/data/seed.ts` (about the removed `gallery` field and the new required `SiteSettings` fields). No errors anywhere else. If you see errors elsewhere, stop and investigate before continuing.

- [ ] **Step 6: Commit**

```bash
git add src/types/
git commit -m "feat: add StillItem gallery type, split Project.gallery, extend SiteSettings

Type-only change — src/lib and src/data callers are updated in a later task."
```

---

### Task 5: Pure band-grouping layout function

**Files:**
- Create: `src/lib/gallery-layout.ts`
- Test: `tests/unit/gallery-layout.test.ts`

**Interfaces:**
- Consumes: `StillItem` from `@/types`.
- Produces: `groupIntoRows(items: StillItem[]): StillRow[]`, `interface StillRow { orientation: StillOrientation; items: { itemIndex: number; aspectRatio: number }[] }` — both exported from `@/lib/gallery-layout`. `ClusteredStillsGrid` (Task 6) consumes `groupIntoRows` and `StillRow` directly.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/gallery-layout.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { groupIntoRows } from "@/lib/gallery-layout";
import type { StillItem } from "@/types";

function landscapeImage(): StillItem {
  return { kind: "image", image: { url: "/l.jpg", alt: "", width: 1920, height: 1080 } };
}
function portraitImage(): StillItem {
  return { kind: "image", image: { url: "/p.jpg", alt: "", width: 1080, height: 1920 } };
}

describe("groupIntoRows", () => {
  it("splits a run of 5 landscape images into rows of 2, 2, 1", () => {
    const items = [
      landscapeImage(),
      landscapeImage(),
      landscapeImage(),
      landscapeImage(),
      landscapeImage(),
    ];
    const rows = groupIntoRows(items);
    expect(rows.map((row) => row.items.length)).toEqual([2, 2, 1]);
    expect(rows.every((row) => row.orientation === "landscape")).toBe(true);
  });

  it("splits a run of 7 portrait images into rows of 4, 3", () => {
    const items = Array.from({ length: 7 }, () => portraitImage());
    const rows = groupIntoRows(items);
    expect(rows.map((row) => row.items.length)).toEqual([4, 3]);
    expect(rows.every((row) => row.orientation === "portrait")).toBe(true);
  });

  it("starts a new row when orientation changes, even mid-run", () => {
    const items = [portraitImage(), portraitImage(), landscapeImage(), portraitImage()];
    const rows = groupIntoRows(items);
    expect(rows.map((row) => ({ orientation: row.orientation, count: row.items.length }))).toEqual([
      { orientation: "portrait", count: 2 },
      { orientation: "landscape", count: 1 },
      { orientation: "portrait", count: 1 },
    ]);
  });

  it("uses each item's own aspect ratio for its row entry", () => {
    const rows = groupIntoRows([landscapeImage()]);
    expect(rows[0].items[0].aspectRatio).toBeCloseTo(1920 / 1080);
  });

  it("classifies a BTS video clip's orientation from its explicit field, not pixel dimensions", () => {
    const clip: StillItem = { kind: "video", url: "/clip.mp4", orientation: "portrait" };
    const rows = groupIntoRows([clip, portraitImage()]);
    expect(rows).toHaveLength(1);
    expect(rows[0].orientation).toBe("portrait");
    expect(rows[0].items[0].aspectRatio).toBeCloseTo(9 / 16);
  });

  it("returns no rows for an empty item list", () => {
    expect(groupIntoRows([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npx vitest run tests/unit/gallery-layout.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/gallery-layout'` (the file doesn't exist yet).

- [ ] **Step 3: Implement `groupIntoRows`**

Create `src/lib/gallery-layout.ts`:

```ts
import type { StillItem, StillOrientation } from "@/types";

const LANDSCAPE_ROW_SIZE = 2;
const PORTRAIT_ROW_SIZE = 4;

function itemOrientation(item: StillItem): StillOrientation {
  if (item.kind === "video") return item.orientation;
  return item.image.height > item.image.width ? "portrait" : "landscape";
}

function itemAspectRatio(item: StillItem): number {
  if (item.kind === "video") return item.orientation === "portrait" ? 9 / 16 : 16 / 9;
  return item.image.width / item.image.height;
}

export interface StillRow {
  orientation: StillOrientation;
  items: { itemIndex: number; aspectRatio: number }[];
}

/**
 * Groups items into same-orientation rows without reordering them — runs of
 * consecutive portrait items become rows of up to 4, runs of consecutive
 * landscape items become rows of up to 2. This is the "banded justified
 * grid" from docs/superpowers/specs/2026-07-21-project-page-gallery-redesign-design.md.
 */
export function groupIntoRows(items: StillItem[]): StillRow[] {
  const rows: StillRow[] = [];
  let runStart = 0;

  while (runStart < items.length) {
    const orientation = itemOrientation(items[runStart]);
    let runEnd = runStart;
    while (runEnd < items.length && itemOrientation(items[runEnd]) === orientation) {
      runEnd += 1;
    }

    const chunkSize = orientation === "portrait" ? PORTRAIT_ROW_SIZE : LANDSCAPE_ROW_SIZE;
    let chunkStart = runStart;
    while (chunkStart < runEnd) {
      const chunkEnd = Math.min(chunkStart + chunkSize, runEnd);
      const rowItems: StillRow["items"] = [];
      for (let itemIndex = chunkStart; itemIndex < chunkEnd; itemIndex += 1) {
        rowItems.push({ itemIndex, aspectRatio: itemAspectRatio(items[itemIndex]) });
      }
      rows.push({ orientation, items: rowItems });
      chunkStart = chunkEnd;
    }

    runStart = runEnd;
  }

  return rows;
}
```

- [ ] **Step 4: Run the test again and confirm it passes**

```bash
npx vitest run tests/unit/gallery-layout.test.ts
```

Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/gallery-layout.ts tests/unit/gallery-layout.test.ts
git commit -m "feat: add groupIntoRows pure function for the banded justified gallery layout"
```

---

### Task 6: `ClusteredStillsGrid` component

**Files:**
- Create: `src/components/media/ClusteredStillsGrid.tsx`
- Test: `tests/unit/clustered-stills-grid.test.tsx`

**Interfaces:**
- Consumes: `groupIntoRows`/`StillRow` from `@/lib/gallery-layout`; `StillItem`, `ImageAsset` from `@/types`; `Lightbox` from `./Lightbox` (existing, unchanged — props `images: ImageAsset[]`, `index: number`, `onClose/onNext/onPrevious: () => void`, `labels: {close,next,previous}`).
- Produces: `ClusteredStillsGrid({ items: StillItem[]; defaultDisplayCount: number; lightboxLabels: {close,next,previous} })` — the component `work/[slug]/page.tsx` (Task 9) renders for Film Stills, Behind the Scenes, and Photo Gallery.

Do **not** delete `src/components/media/PhotoGallery.tsx` in this task — `work/[slug]/page.tsx` still imports it until Task 9 rewires the page. Deleting it now would break the build.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/clustered-stills-grid.test.tsx`:

```tsx
import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClusteredStillsGrid } from "@/components/media/ClusteredStillsGrid";
import type { StillItem } from "@/types";

vi.mock("next/image", () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

const labels = { close: "Close", next: "Next", previous: "Previous" };

function image(alt: string, width = 1920, height = 1080): StillItem {
  return { kind: "image", image: { url: `/${alt}.jpg`, alt, width, height } };
}

describe("ClusteredStillsGrid", () => {
  it("renders every item — default count in the grid, the rest in the overflow filmstrip", () => {
    const items = Array.from({ length: 10 }, (_, i) => image(`still-${i}`));
    render(<ClusteredStillsGrid items={items} defaultDisplayCount={8} lightboxLabels={labels} />);

    expect(screen.getAllByRole("img")).toHaveLength(10);
    expect(screen.getByAltText("still-0")).toBeInTheDocument();
    expect(screen.getByAltText("still-9")).toBeInTheDocument();
  });

  it("opens the Lightbox at the clicked image's position and navigates across the full set", async () => {
    const user = userEvent.setup();
    const items = Array.from({ length: 3 }, (_, i) => image(`still-${i}`));
    render(<ClusteredStillsGrid items={items} defaultDisplayCount={8} lightboxLabels={labels} />);

    await user.click(screen.getByAltText("still-1").closest("button")!);
    const dialog = screen.getByRole("dialog");
    expect(dialog.querySelector("img")).toHaveAttribute("alt", "still-1");

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(dialog.querySelector("img")).toHaveAttribute("alt", "still-2");
  });

  it("renders a BTS video clip as a muted looping video that is not clickable into the Lightbox", () => {
    const items: StillItem[] = [{ kind: "video", url: "/clip.mp4", orientation: "landscape" }];
    render(<ClusteredStillsGrid items={items} defaultDisplayCount={8} lightboxLabels={labels} />);

    const video = document.querySelector("video") as HTMLVideoElement;
    expect(video).toBeInTheDocument();
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.autoplay).toBe(true);
    expect(video.closest("button")).toBeNull();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npx vitest run tests/unit/clustered-stills-grid.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/media/ClusteredStillsGrid'`.

- [ ] **Step 3: Implement the component**

Create `src/components/media/ClusteredStillsGrid.tsx`:

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import type { ImageAsset, StillItem } from "@/types";
import { groupIntoRows } from "@/lib/gallery-layout";
import { Lightbox } from "./Lightbox";

function isImageItem(item: StillItem): item is { kind: "image"; image: ImageAsset } {
  return item.kind === "image";
}

function StillTile({ item }: { item: StillItem }) {
  if (item.kind === "video") {
    return (
      <video src={item.url} muted loop autoPlay playsInline className="h-full w-full object-cover" />
    );
  }
  return (
    <Image src={item.image.url} alt={item.image.alt} fill sizes="50vw" className="object-cover" />
  );
}

/**
 * Shared grid engine for Film Stills, Behind the Scenes, and Photo Gallery.
 * Rows are grouped by orientation (`groupIntoRows`); within a row, each
 * item's flex-grow equals its own aspect ratio, so the browser distributes
 * width proportionally and every image renders at its true aspect ratio
 * with zero client-side measurement (docs/superpowers/specs/2026-07-21-project-page-gallery-redesign-design.md).
 */
export function ClusteredStillsGrid({
  items,
  defaultDisplayCount,
  lightboxLabels,
}: {
  items: StillItem[];
  defaultDisplayCount: number;
  lightboxLabels: { close: string; next: string; previous: string };
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const visibleItems = items.slice(0, defaultDisplayCount);
  const overflowItems = items.slice(defaultDisplayCount);
  const rows = groupIntoRows(visibleItems);

  const lightboxImages = items.filter(isImageItem).map((item) => item.image);
  const lightboxIndexByItemIndex = new Map<number, number>();
  let lightboxCounter = 0;
  items.forEach((item, itemIndex) => {
    if (isImageItem(item)) {
      lightboxIndexByItemIndex.set(itemIndex, lightboxCounter);
      lightboxCounter += 1;
    }
  });

  const renderTile = (item: StillItem, itemIndex: number, tileClassName: string) => {
    const lightboxIndex = lightboxIndexByItemIndex.get(itemIndex);
    if (isImageItem(item) && lightboxIndex !== undefined) {
      return (
        <button
          key={itemIndex}
          type="button"
          onClick={() => setOpenIndex(lightboxIndex)}
          className={`bg-bg-secondary relative overflow-hidden ${tileClassName}`}
        >
          <StillTile item={item} />
        </button>
      );
    }
    return (
      <div key={itemIndex} className={`bg-bg-secondary relative overflow-hidden ${tileClassName}`}>
        <StillTile item={item} />
      </div>
    );
  };

  return (
    <div>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="mb-2 flex h-[220px] gap-2 sm:h-[260px] lg:h-[300px]">
          {row.items.map(({ itemIndex, aspectRatio }) => (
            <div key={itemIndex} style={{ flexGrow: aspectRatio, flexShrink: 1, flexBasis: 0 }}>
              {renderTile(items[itemIndex], itemIndex, "h-full w-full")}
            </div>
          ))}
        </div>
      ))}

      {overflowItems.length > 0 && (
        <div className="border-border mt-4 flex gap-2 overflow-x-auto border-t border-dashed pt-3">
          {overflowItems.map((item, offset) =>
            renderTile(item, defaultDisplayCount + offset, "h-16 w-16 flex-shrink-0"),
          )}
        </div>
      )}

      {openIndex !== null && (
        <Lightbox
          images={lightboxImages}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNext={() => setOpenIndex((current) => ((current ?? 0) + 1) % lightboxImages.length)}
          onPrevious={() =>
            setOpenIndex((current) => ((current ?? 0) - 1 + lightboxImages.length) % lightboxImages.length)
          }
          labels={lightboxLabels}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run the test again and confirm it passes**

```bash
npx vitest run tests/unit/clustered-stills-grid.test.tsx
```

Expected: PASS, 3 tests.

- [ ] **Step 5: Type-check**

```bash
npm run typecheck
```

Expected: same three pre-existing failing files as after Task 4 (`queries.ts`, `seed-queries.ts`, `seed.ts`) — no new errors from this component.

- [ ] **Step 6: Commit**

```bash
git add src/components/media/ClusteredStillsGrid.tsx tests/unit/clustered-stills-grid.test.tsx
git commit -m "feat: add ClusteredStillsGrid — banded justified layout with overflow filmstrip"
```

---

### Task 7: `ProjectMeta` Camera/Lenses rows

**Files:**
- Modify: `src/components/portfolio/ProjectMeta.tsx`
- Test: `tests/unit/project-meta.test.tsx` (new)

**Interfaces:**
- Consumes: `ResolvedProject` from `@/types` (already has `camera?`/`lenses?` from Task 4).
- Produces: `ProjectMeta`'s `labels` prop now requires `camera: string` and `lenses: string` in addition to the existing keys — `work/[slug]/page.tsx` (Task 9) must pass them.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/project-meta.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectMeta } from "@/components/portfolio/ProjectMeta";

const baseProject = {
  slug: "test-project",
  type: "video" as const,
  title: "Test Project",
  year: "2025",
  role: "Cinematographer",
  description: "A test project.",
  coverImage: { url: "/cover.jpg", alt: "Cover", width: 1600, height: 1000 },
  order: 1,
  featured: false,
};

const labels = {
  year: "Year",
  location: "Location",
  role: "Role",
  producerDirector: "Producer / Director",
  recognition: "Recognition",
  camera: "Camera",
  lenses: "Lenses",
};

describe("ProjectMeta", () => {
  it("renders Camera and Lenses rows when set", () => {
    render(
      <ProjectMeta
        project={{ ...baseProject, camera: "ARRI Alexa Mini", lenses: "Cooke Anamorphic" }}
        labels={labels}
      />,
    );

    expect(screen.getByText("Camera")).toBeInTheDocument();
    expect(screen.getByText("ARRI Alexa Mini")).toBeInTheDocument();
    expect(screen.getByText("Lenses")).toBeInTheDocument();
    expect(screen.getByText("Cooke Anamorphic")).toBeInTheDocument();
  });

  it("omits Camera and Lenses rows when not set", () => {
    render(<ProjectMeta project={baseProject} labels={labels} />);

    expect(screen.queryByText("Camera")).not.toBeInTheDocument();
    expect(screen.queryByText("Lenses")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
npx vitest run tests/unit/project-meta.test.tsx
```

Expected: FAIL — the first test fails because `camera`/`lenses` aren't rendered (current `ProjectMeta` doesn't know about them); TypeScript will also flag the `labels` prop as missing `camera`/`lenses` if you run typecheck, but Vitest itself still executes.

- [ ] **Step 3: Implement the change**

Replace `src/components/portfolio/ProjectMeta.tsx` with:

```tsx
import type { ResolvedProject } from "@/types";

function MetaRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-text-secondary text-xs tracking-wide uppercase">{label}</dt>
      <dd className="text-text text-sm">{value}</dd>
    </div>
  );
}

/**
 * Optional fields (location, producerDirector, recognition, camera, lenses)
 * are simply omitted when absent — never rendered empty (FR-010, spec Edge
 * Cases).
 */
export function ProjectMeta({
  project,
  labels,
}: {
  project: ResolvedProject;
  labels: {
    year: string;
    location: string;
    role: string;
    producerDirector: string;
    recognition: string;
    camera: string;
    lenses: string;
  };
}) {
  return (
    <div>
      <h1 className="text-3xl font-semibold sm:text-4xl">{project.title}</h1>
      <p className="text-text-secondary mt-4 max-w-2xl text-base">{project.description}</p>
      <dl className="border-border mt-8 grid grid-cols-2 gap-x-8 gap-y-6 border-t pt-8 sm:grid-cols-3">
        <MetaRow label={labels.year} value={project.year} />
        <MetaRow label={labels.location} value={project.location} />
        <MetaRow label={labels.role} value={project.role} />
        <MetaRow label={labels.producerDirector} value={project.producerDirector} />
        <MetaRow label={labels.recognition} value={project.recognition} />
        <MetaRow label={labels.camera} value={project.camera} />
        <MetaRow label={labels.lenses} value={project.lenses} />
      </dl>
    </div>
  );
}
```

- [ ] **Step 4: Run the test again and confirm it passes**

```bash
npx vitest run tests/unit/project-meta.test.tsx
```

Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add src/components/portfolio/ProjectMeta.tsx tests/unit/project-meta.test.tsx
git commit -m "feat: add Camera/Lenses rows to ProjectMeta"
```

---

### Task 8: Wire GROQ queries, seed-queries, and seed data

This task has no new automated tests of its own — it's pure wiring on top of logic already tested in Tasks 5-7, and the existing `seed-queries-*.test.ts` files (which mock `@/data/seed` with minimal fixtures) are expected to keep passing unchanged because `resolveLocalized(undefined, locale) ?? ""` degrades gracefully. Verification is the full test suite staying green plus the manual curl checks below.

**Files:**
- Modify: `src/lib/sanity/queries.ts`
- Modify: `src/lib/content/seed-queries.ts`
- Modify: `src/data/seed.ts`

- [ ] **Step 1: Add the BTS raw-item mapper and update the project projection/types**

In `src/lib/sanity/queries.ts`, add `StillItem` to the existing `import type {...} from "@/types"` block at the top of the file.

Replace the `SanityProjectDoc` interface with:

```ts
interface SanityProjectDoc {
  slug: string;
  type: ProjectType;
  title: Localized<string>;
  year: string;
  location?: string;
  role: Localized<string>;
  camera?: string;
  lenses?: string;
  producerDirector?: Localized<string>;
  recognition?: Localized<string>;
  description: Localized<string>;
  coverImage: SanityImageRef;
  youtubeUrl?: string;
  previewClipUrl?: string;
  filmStills?: SanityImageRef[];
  behindTheScenes?: SanityBtsRawItem[];
  photoGallery?: SanityImageRef[];
  order: number;
  featured: boolean;
}

interface SanityBtsRawItem {
  _type: string;
  alt?: string;
  asset?: { metadata?: { dimensions?: { width: number; height: number } } };
  orientation?: "landscape" | "portrait";
  fileUrl?: string;
}
```

Add this function above `getProjectBySlug`:

```ts
function toStillItems(raw: SanityBtsRawItem[] | undefined): StillItem[] {
  if (!raw) return [];
  return raw.map((entry) => {
    if (entry._type === "btsVideoClip") {
      return { kind: "video" as const, url: entry.fileUrl ?? "", orientation: entry.orientation ?? "landscape" };
    }
    return { kind: "image" as const, image: toImageAsset(entry as SanityImageRef) };
  });
}
```

Replace `PROJECT_FULL_PROJECTION` with:

```ts
const PROJECT_FULL_PROJECTION = `{
  "slug": slug.current,
  type,
  title,
  year,
  location,
  role,
  camera,
  lenses,
  producerDirector,
  recognition,
  description,
  coverImage{..., asset->{_id, metadata{dimensions}}},
  youtubeUrl,
  "previewClipUrl": previewClip.asset->url,
  "filmStills": filmStills[]{..., asset->{_id, metadata{dimensions}}},
  "behindTheScenes": behindTheScenes[]{
    _type,
    alt,
    "asset": asset->{_id, metadata{dimensions}},
    orientation,
    "fileUrl": file.asset->url
  },
  "photoGallery": photoGallery[]{..., asset->{_id, metadata{dimensions}}},
  order,
  featured
}`;
```

In `getProjectBySlug`, replace:

```ts
    gallery: doc.gallery?.map((image) => toImageAsset(image)),
```

with:

```ts
    camera: doc.camera,
    lenses: doc.lenses,
    filmStills: doc.filmStills?.map((image) => toImageAsset(image)),
    behindTheScenes: toStillItems(doc.behindTheScenes),
    photoGallery: doc.photoGallery?.map((image) => toImageAsset(image)),
```

- [ ] **Step 2: Update `SanitySiteSettingsDoc` and `getSiteSettings`**

In `src/lib/sanity/queries.ts`, add to `SanitySiteSettingsDoc`:

```ts
  galleryDefaultDisplayCount?: number;
  filmStillsHeading?: Localized<string>;
  cameraFieldLabel?: Localized<string>;
  lensesFieldLabel?: Localized<string>;
```

In `getSiteSettings`'s return statement, add:

```ts
    galleryDefaultDisplayCount: doc.galleryDefaultDisplayCount ?? 8,
    filmStillsHeading: resolveLocalized(doc.filmStillsHeading, locale) ?? "",
    cameraFieldLabel: resolveLocalized(doc.cameraFieldLabel, locale) ?? "",
    lensesFieldLabel: resolveLocalized(doc.lensesFieldLabel, locale) ?? "",
```

- [ ] **Step 3: Update `seed-queries.ts`**

In `src/lib/content/seed-queries.ts`, in `getProjectBySlug`, replace:

```ts
    gallery: project.gallery,
```

with:

```ts
    camera: project.camera,
    lenses: project.lenses,
    filmStills: project.filmStills,
    behindTheScenes: project.behindTheScenes,
    photoGallery: project.photoGallery,
```

In `getSiteSettings`, add:

```ts
    galleryDefaultDisplayCount: siteSettings.galleryDefaultDisplayCount,
    filmStillsHeading: resolveLocalized(siteSettings.filmStillsHeading, locale) ?? "",
    cameraFieldLabel: resolveLocalized(siteSettings.cameraFieldLabel, locale) ?? "",
    lensesFieldLabel: resolveLocalized(siteSettings.lensesFieldLabel, locale) ?? "",
```

- [ ] **Step 4: Update `src/data/seed.ts`**

For the `the-withshaw-case` project, replace:

```ts
    gallery: [
      image("/projects/the-withshaw-case/bts-1.svg", "Behind the scenes 1", 1600, 1000),
      image("/projects/the-withshaw-case/bts-2.svg", "Behind the scenes 2", 1600, 1000),
    ],
```

with:

```ts
    camera: "ARRI Alexa Mini",
    lenses: "Sigma Cine Primes",
    behindTheScenes: [
      {
        kind: "image",
        image: image("/projects/the-withshaw-case/bts-1.svg", "Behind the scenes 1", 1600, 1000),
      },
      {
        kind: "image",
        image: image("/projects/the-withshaw-case/bts-2.svg", "Behind the scenes 2", 1600, 1000),
      },
    ],
```

For the `yara-steel` project, replace:

```ts
    gallery: [
      image("/projects/yara-steel/bts-1.svg", "Behind the scenes 1", 1600, 1000),
      image("/projects/yara-steel/bts-2.svg", "Behind the scenes 2", 1600, 1000),
    ],
```

with:

```ts
    camera: "RED V-Raptor",
    lenses: "Cooke Anamorphic/i SF",
    behindTheScenes: [
      { kind: "image", image: image("/projects/yara-steel/bts-1.svg", "Behind the scenes 1", 1600, 1000) },
      { kind: "image", image: image("/projects/yara-steel/bts-2.svg", "Behind the scenes 2", 1600, 1000) },
    ],
```

For the `coastal-frames` project, rename the field only — replace:

```ts
    gallery: [
```

with:

```ts
    photoGallery: [
```

(leave the six `image(...)` entries below it unchanged).

At the end of the `siteSettings` object (right before its closing `};`), add:

```ts
  galleryDefaultDisplayCount: 8,
  filmStillsHeading: { en: "Film Stills", uk: "Кадри фільму" },
  cameraFieldLabel: { en: "Camera", uk: "Камера" },
  lensesFieldLabel: { en: "Lenses", uk: "Об'єктиви" },
```

- [ ] **Step 5: Type-check and run the full unit suite**

```bash
npm run typecheck
npx vitest run
```

Expected: both fully clean now (this was the task that fixed the three files flagged since Task 4). No test file changes were needed in this task.

- [ ] **Step 6: Commit**

```bash
git add src/lib/sanity/queries.ts src/lib/content/seed-queries.ts src/data/seed.ts
git commit -m "feat: wire filmStills/behindTheScenes/photoGallery/camera/lenses through queries and seed data"
```

---

### Task 9: Wire the project detail page and retire `PhotoGallery`

**Files:**
- Modify: `src/app/[locale]/work/[slug]/page.tsx`
- Modify: `tests/unit/project-video-fallback.test.tsx`
- Modify: `tests/e2e/photo-lightbox.spec.ts`
- Delete: `src/components/media/PhotoGallery.tsx`

- [ ] **Step 1: Rewrite the project page**

Replace `src/app/[locale]/work/[slug]/page.tsx` with:

```tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import type { Locale, StillItem } from "@/types";
import { isLocale, getMessages, localizedAlternates } from "@/lib/i18n";
import { getAdjacentProjects, getProjectBySlug, getSiteSettings } from "@/lib/content/queries";
import { ProjectMeta } from "@/components/portfolio/ProjectMeta";
import { PrevNextNav } from "@/components/portfolio/PrevNextNav";
import { ClusteredStillsGrid } from "@/components/media/ClusteredStillsGrid";
import { HeroVideoPlayer } from "@/components/media/HeroVideoPlayer";

async function loadProject(rawLocale: string, slug: string) {
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const project = await getProjectBySlug(slug, locale);
  if (!project) notFound();
  return { locale, project };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) return {};
  const project = await getProjectBySlug(slug, rawLocale);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    alternates: { languages: localizedAlternates(`/work/${slug}`) },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const { locale, project } = await loadProject(rawLocale, slug);

  const t = getMessages(locale);
  const [siteSettings, adjacent] = await Promise.all([
    getSiteSettings(locale),
    getAdjacentProjects(project.order, locale),
  ]);

  const lightboxLabels = {
    close: t.lightbox.close,
    next: t.lightbox.next,
    previous: t.lightbox.previous,
  };

  const filmStillItems: StillItem[] = (project.filmStills ?? []).map((image) => ({
    kind: "image",
    image,
  }));
  const photoGalleryItems: StillItem[] = (project.photoGallery ?? []).map((image) => ({
    kind: "image",
    image,
  }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {project.type === "video" && project.youtubeUrl && (
        <HeroVideoPlayer
          youtubeUrl={project.youtubeUrl}
          coverImage={project.coverImage}
          previewClipUrl={project.previewClipUrl}
          playLabel={t.project.playVideo}
        />
      )}

      {project.type === "video" && !project.youtubeUrl && (
        <div className="bg-bg-secondary relative aspect-video w-full overflow-hidden">
          <Image
            src={project.coverImage.url}
            alt={project.coverImage.alt}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="mt-10">
        <ProjectMeta
          project={project}
          labels={{
            year: siteSettings.yearFieldLabel,
            location: siteSettings.locationFieldLabel,
            role: siteSettings.roleFieldLabel,
            producerDirector: siteSettings.producerDirectorFieldLabel,
            recognition: siteSettings.recognitionFieldLabel,
            camera: siteSettings.cameraFieldLabel,
            lenses: siteSettings.lensesFieldLabel,
          }}
        />
      </div>

      {project.type === "video" && filmStillItems.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-semibold">{siteSettings.filmStillsHeading}</h2>
          <div className="mt-6">
            <ClusteredStillsGrid
              items={filmStillItems}
              defaultDisplayCount={siteSettings.galleryDefaultDisplayCount}
              lightboxLabels={lightboxLabels}
            />
          </div>
        </div>
      )}

      {project.type === "video" && project.behindTheScenes && project.behindTheScenes.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-semibold">{siteSettings.behindTheScenesHeading}</h2>
          <div className="mt-6">
            <ClusteredStillsGrid
              items={project.behindTheScenes}
              defaultDisplayCount={siteSettings.galleryDefaultDisplayCount}
              lightboxLabels={lightboxLabels}
            />
          </div>
        </div>
      )}

      {project.type === "photo" && photoGalleryItems.length > 0 && (
        <div className="mt-4">
          <h2 className="sr-only">{t.project.gallery}</h2>
          <ClusteredStillsGrid
            items={photoGalleryItems}
            defaultDisplayCount={siteSettings.galleryDefaultDisplayCount}
            lightboxLabels={lightboxLabels}
          />
        </div>
      )}

      <PrevNextNav
        adjacent={adjacent}
        locale={locale}
        labels={{ previous: siteSettings.previousProjectLabel, next: siteSettings.nextProjectLabel }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Update the existing page test's `getSiteSettings` mock**

In `tests/unit/project-video-fallback.test.tsx`, replace the `vi.mock("@/lib/content/queries", ...)` block with:

```ts
vi.mock("@/lib/content/queries", () => ({
  getProjectBySlug: vi.fn(),
  getAdjacentProjects: vi.fn().mockResolvedValue({ previous: null, next: null }),
  getSiteSettings: vi.fn().mockResolvedValue({
    yearFieldLabel: "Year",
    locationFieldLabel: "Location",
    roleFieldLabel: "Role",
    producerDirectorFieldLabel: "Producer / Director",
    recognitionFieldLabel: "Recognition",
    cameraFieldLabel: "Camera",
    lensesFieldLabel: "Lenses",
    behindTheScenesHeading: "Behind the Scenes",
    filmStillsHeading: "Film Stills",
    previousProjectLabel: "Previous project",
    nextProjectLabel: "Next project",
    galleryDefaultDisplayCount: 8,
  }),
}));
```

- [ ] **Step 3: Run that test file and confirm it still passes**

```bash
npx vitest run tests/unit/project-video-fallback.test.tsx
```

Expected: PASS, 2 tests (unchanged behavior — `baseProject` in that file has no `filmStills`/`behindTheScenes`/`photoGallery`, so neither new section renders, matching the original assertions).

- [ ] **Step 4: Delete the superseded component**

```bash
git rm src/components/media/PhotoGallery.tsx
```

- [ ] **Step 5: Point the e2e test at a real live photo project**

In `tests/e2e/photo-lightbox.spec.ts`, replace:

```ts
    await page.goto("/en/work/coastal-frames");
```

with:

```ts
    await page.goto("/en/work/scales-photoshoot");
```

(`coastal-frames` only exists in the seed-data fallback; `scales-photoshoot` is a real published photo project with 10 images in the live Sanity dataset, so this test now exercises real production data — including the grid/filmstrip split, since 10 > the default display count of 8.)

- [ ] **Step 6: Full verification**

```bash
npm run typecheck
npx eslint src sanity tests
npx vitest run
```

Expected: all three clean.

```bash
npm run test:e2e
```

Expected: `Photo lightbox` suite passes against `/en/work/scales-photoshoot`. This spins up a real `next build && next start` against live Sanity data (per `playwright.config.ts`), so it takes longer — run it, but don't block on flakiness unrelated to this change (e.g. network timeouts) without investigating first.

- [ ] **Step 7: Commit**

```bash
git add src/app/ tests/
git commit -m "feat: wire Film Stills / Photo Gallery / BTS sections into the project page, retire PhotoGallery"
```

---

### Task 10: Manual smoke test against live content

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Check a video project with BTS + gear fields**

```bash
curl -s http://localhost:3000/en/work/yara-steel | grep -oE '<dt[^>]*>[^<]*</dt>|<dd[^>]*>[^<]*</dd>|<h2[^>]*>[^<]*</h2>'
```

Expected: `Camera`/`RED V-Raptor` and `Lenses`/`Cooke Anamorphic/i SF` rows are present (once you've filled them in via Studio — the migration script does not add gear values, only field labels; add real values for at least one live project to verify end-to-end), and a "Behind the Scenes" heading with 2 items rendering.

- [ ] **Step 3: Check the photo project with 10 images (default count 8)**

```bash
curl -s http://localhost:3000/en/work/scales-photoshoot | grep -c '<img'
```

Expected: at least 10 `<img>` tags (8 in the clustered grid + 2 in the overflow filmstrip, same total-count guarantee verified by the `ClusteredStillsGrid` unit test).

- [ ] **Step 4: Stop the dev server**

```bash
pkill -f "next dev" 2>/dev/null || true
```

- [ ] **Step 5: Tell the user**

Report that the feature is verified against live data, and remind them:
- Fill in `filmStills`, `camera`, and `lenses` for at least one project in Sanity Studio to see those sections/rows live (they're empty until authored).
- If a fresh `SANITY_MIGRATION_TOKEN` was created for Task 3, revoke it now.

No commit — this task produces no file changes.
