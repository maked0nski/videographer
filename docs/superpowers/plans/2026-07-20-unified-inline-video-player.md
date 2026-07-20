# Unified Inline Video Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the project detail page's static-poster-and-modal video flow with a seamless inline player — a muted looping preview (when a preview clip is set) that crossfades in place into a live YouTube embed with sound and controls on click, no dialog. Also add missing content-authoring `description` text across all three Sanity Studio schemas.

**Architecture:** A new `HeroVideoPlayer` client component replaces `VideoPlayerTrigger` on the project detail page only. It renders three stacked absolutely-positioned layers inside one fixed-`aspect-video` container (no CLS): a lazily-mounted YouTube iframe (bottom), a preview layer that is either a muted looping `<video>` or the cover `<Image>` (middle, opaque until clicked), and a Play-button overlay (top of the preview layer). Clicking Play mounts the iframe (if not already) and fades the preview layer to `opacity-0`, revealing the already-initializing iframe underneath — no unmount, no black flash, no dialog. `VideoModal` and `ShowreelButton` (homepage) are untouched; only the project page stops using them. The one existing piece of shared logic (`toYoutubeNoCookieEmbedUrl`) moves to a shared module so both the untouched modal and the new component use the same parser.

**Tech Stack:** Next.js 16 (App Router), React 19 client component (`"use client"`), Tailwind CSS 4, Sanity Studio v6, Vitest + Testing Library + `@testing-library/user-event`.

## Global Constraints

- No network request to `youtube-nocookie.com` may fire before the visitor clicks Play (carried over from the existing FR-003/FR-004/FR-014 guarantee) — the iframe must be conditionally rendered (`{isActive && ...}`), never rendered hidden.
- The preview layer is never unmounted on activation — it fades via CSS opacity and is paused (not removed) once the fade completes, so the iframe underneath is never revealed against a bare background.
- `VideoModal.tsx` and `ShowreelButton.tsx` must not change behavior — the homepage showreel button keeps using the dialog.
- No JS-based autoplay success/failure detection (no `.play().then/catch`) — rely on native `<video autoPlay muted loop playsInline poster>` fallback behavior only.
- No aspect-ratio-mismatch/modal-fallback branch — out of scope (YAGNI) until a real project needs it.
- `previewClip` in Sanity is optional, video-type only, no `required()` validation.
- All existing tests (`npm run test:unit`) must keep passing after every task.

---

### Task 1: Extract the shared YouTube embed-URL helper

**Files:**
- Create: `src/lib/youtube.ts`
- Modify: `src/components/media/VideoModal.tsx`
- Test: `tests/unit/youtube.test.ts` (new)

**Interfaces:**
- Produces: `toYoutubeNoCookieEmbedUrl(youtubeUrl: string): string | null` — consumed by `VideoModal.tsx` (unchanged behavior) and, in Task 3, `HeroVideoPlayer.tsx`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/youtube.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test:unit -- youtube.test`
Expected: FAIL — `src/lib/youtube.ts` does not exist yet (module not found).

- [ ] **Step 3: Create the shared helper**

Create `src/lib/youtube.ts`:

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test:unit -- youtube.test`
Expected: PASS (all 4 cases)

- [ ] **Step 5: Update `VideoModal.tsx` to use the shared helper**

In `src/components/media/VideoModal.tsx`, remove the local `toYoutubeNoCookieEmbedUrl` function definition (currently defined at the top of the file, above the `VideoModal` component) and import it instead:

Replace:

```tsx
"use client";

import { useRef } from "react";
import { CloseButton } from "@/components/ui/CloseButton";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

function toYoutubeNoCookieEmbedUrl(youtubeUrl: string): string | null {
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
```

with:

```tsx
"use client";

import { useRef } from "react";
import { CloseButton } from "@/components/ui/CloseButton";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";
import { toYoutubeNoCookieEmbedUrl } from "@/lib/youtube";
```

Nothing else in `VideoModal.tsx` changes — the function's call site and behavior are identical.

- [ ] **Step 6: Run the full unit suite and typecheck**

Run: `npm run test:unit && npm run typecheck`
Expected: PASS, no errors (this is a pure extraction — no behavior changed for `VideoModal`)

- [ ] **Step 7: Commit**

```bash
git add src/lib/youtube.ts src/components/media/VideoModal.tsx tests/unit/youtube.test.ts
git commit -m "refactor: extract shared YouTube embed-URL parser to src/lib/youtube.ts"
```

---

### Task 2: Optional `previewClip` field on video projects

**Files:**
- Modify: `sanity/schemaTypes/project.ts`
- Modify: `src/types/project.ts`
- Modify: `src/lib/content/seed-queries.ts`
- Modify: `src/lib/sanity/queries.ts`
- Test: `tests/unit/seed-queries-preview-clip.test.ts` (new)

**Interfaces:**
- Produces: `Project.previewClipUrl?: string`, `ResolvedProject.previewClipUrl?: string` — consumed by Task 3's `HeroVideoPlayer` and by `work/[slug]/page.tsx`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/seed-queries-preview-clip.test.ts`:

```tsx
import { describe, expect, it, vi } from "vitest";

const baseProject = {
  slug: "the-withshaw-case",
  type: "video" as const,
  title: { en: "The Withshaw Case", uk: "The Withshaw Case" },
  year: "2025",
  role: { en: "Cinematographer", uk: "Оператор" },
  description: { en: "A thriller-drama.", uk: "Триллер." },
  coverImage: { url: "/cover.jpg", alt: "Cover", width: 1600, height: 1000 },
  order: 1,
  featured: true,
  published: true,
};

describe("getProjectBySlug (seed-backed)", () => {
  it("passes through previewClipUrl when set on the seed project", async () => {
    vi.doMock("@/data/seed", () => ({
      profile: {},
      projects: [{ ...baseProject, previewClipUrl: "/previews/the-withshaw-case.mp4" }],
      siteSettings: { showreelUrl: "", contactCtaText: { en: "", uk: "" } },
    }));
    vi.resetModules();
    const { getProjectBySlug } = await import("@/lib/content/seed-queries");
    const project = await getProjectBySlug("the-withshaw-case", "en");
    expect(project?.previewClipUrl).toBe("/previews/the-withshaw-case.mp4");
  });

  it("omits previewClipUrl when not set on the seed project", async () => {
    vi.doMock("@/data/seed", () => ({
      profile: {},
      projects: [baseProject],
      siteSettings: { showreelUrl: "", contactCtaText: { en: "", uk: "" } },
    }));
    vi.resetModules();
    const { getProjectBySlug } = await import("@/lib/content/seed-queries");
    const project = await getProjectBySlug("the-withshaw-case", "en");
    expect(project?.previewClipUrl).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test:unit -- seed-queries-preview-clip`
Expected: FAIL on the first test — `getProjectBySlug` in `src/lib/content/seed-queries.ts` doesn't return `previewClipUrl` yet, so it's `undefined` even though the mock sets it.

- [ ] **Step 3: Add the field to the Sanity schema**

In `sanity/schemaTypes/project.ts`, insert a new field immediately after the existing `youtubeUrl` field and before `gallery`:

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

- [ ] **Step 4: Add the field to the TypeScript types**

In `src/types/project.ts`, add `previewClipUrl?: string;` to both `Project` (after `youtubeUrl?: string;`) and `ResolvedProject` (after `youtubeUrl?: string;`):

```ts
export interface Project {
  slug: string;
  type: ProjectType;
  title: Localized<string>;
  year: string;
  location?: string;
  role: Localized<string>;
  producerDirector?: Localized<string>;
  recognition?: Localized<string>;
  description: Localized<string>;
  coverImage: ImageAsset;
  /** Required when `type === "video"`; unused when `type === "photo"`. */
  youtubeUrl?: string;
  /** Muted looping preview shown before Play is clicked; video projects only. */
  previewClipUrl?: string;
  /** Behind-the-scenes set for video projects; primary gallery for photo projects. */
  gallery?: ImageAsset[];
  order: number;
  featured: boolean;
  published: boolean;
}
```

```ts
export interface ResolvedProject {
  slug: string;
  type: ProjectType;
  title: string;
  year: string;
  location?: string;
  role: string;
  producerDirector?: string;
  recognition?: string;
  description: string;
  coverImage: ImageAsset;
  youtubeUrl?: string;
  previewClipUrl?: string;
  gallery?: ImageAsset[];
  order: number;
  featured: boolean;
}
```

- [ ] **Step 5: Thread the field through the seed-backed query**

In `src/lib/content/seed-queries.ts`, update `getProjectBySlug`'s return object to add `previewClipUrl: project.previewClipUrl,` (after the existing `youtubeUrl: project.youtubeUrl,` line):

```ts
export async function getProjectBySlug(
  slug: string,
  locale: Locale,
): Promise<ResolvedProject | null> {
  const project = projects.find((candidate) => candidate.slug === slug && candidate.published);
  if (!project) return null;

  return {
    slug: project.slug,
    type: project.type,
    title: resolveLocalized(project.title, locale) ?? "",
    year: project.year,
    location: project.location,
    role: resolveLocalized(project.role, locale) ?? "",
    producerDirector: resolveLocalized(project.producerDirector, locale),
    recognition: resolveLocalized(project.recognition, locale),
    description: resolveLocalized(project.description, locale) ?? "",
    coverImage: project.coverImage,
    youtubeUrl: project.youtubeUrl,
    previewClipUrl: project.previewClipUrl,
    gallery: project.gallery,
    order: project.order,
    featured: project.featured,
  };
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm run test:unit -- seed-queries-preview-clip`
Expected: PASS (both tests)

- [ ] **Step 7: Thread the field through the Sanity-backed query**

In `src/lib/sanity/queries.ts`:

Add `previewClipUrl?: string;` to `SanityProjectDoc` (after `youtubeUrl?: string;`):

```ts
interface SanityProjectDoc {
  slug: string;
  type: ProjectType;
  title: Localized<string>;
  year: string;
  location?: string;
  role: Localized<string>;
  producerDirector?: Localized<string>;
  recognition?: Localized<string>;
  description: Localized<string>;
  coverImage: SanityImageRef;
  youtubeUrl?: string;
  previewClipUrl?: string;
  gallery?: SanityImageRef[];
  order: number;
  featured: boolean;
}
```

Add `"previewClipUrl": previewClip.asset->url,` to `PROJECT_FULL_PROJECTION` (after `youtubeUrl,`):

```ts
const PROJECT_FULL_PROJECTION = `{
  "slug": slug.current,
  type,
  title,
  year,
  location,
  role,
  producerDirector,
  recognition,
  description,
  coverImage,
  youtubeUrl,
  "previewClipUrl": previewClip.asset->url,
  gallery,
  order,
  featured
}`;
```

Add `previewClipUrl: doc.previewClipUrl,` to `getProjectBySlug`'s return object (after `youtubeUrl: doc.youtubeUrl,`):

```ts
  return {
    slug: doc.slug,
    type: doc.type,
    title: resolveLocalized(doc.title, locale) ?? "",
    year: doc.year,
    location: doc.location,
    role: resolveLocalized(doc.role, locale) ?? "",
    producerDirector: resolveLocalized(doc.producerDirector, locale),
    recognition: resolveLocalized(doc.recognition, locale),
    description: resolveLocalized(doc.description, locale) ?? "",
    coverImage: toImageAsset(doc.coverImage),
    youtubeUrl: doc.youtubeUrl,
    previewClipUrl: doc.previewClipUrl,
    gallery: doc.gallery?.map((image) => toImageAsset(image)),
    order: doc.order,
    featured: doc.featured,
  };
```

- [ ] **Step 8: Run the full unit suite and typecheck**

Run: `npm run test:unit && npm run typecheck`
Expected: PASS (all files), no errors

- [ ] **Step 9: Commit**

```bash
git add sanity/schemaTypes/project.ts src/types/project.ts src/lib/content/seed-queries.ts src/lib/sanity/queries.ts tests/unit/seed-queries-preview-clip.test.ts
git commit -m "feat: add optional previewClip field to video projects"
```

---

### Task 3: `HeroVideoPlayer` — inline crossfade player

**Files:**
- Create: `src/components/media/HeroVideoPlayer.tsx`
- Delete: `src/components/media/VideoPlayerTrigger.tsx`
- Modify: `src/app/[locale]/work/[slug]/page.tsx`
- Test: `tests/unit/hero-video-player.test.tsx` (new)

**Interfaces:**
- Consumes: `toYoutubeNoCookieEmbedUrl` (Task 1), `ResolvedProject.previewClipUrl` (Task 2).
- Produces: `HeroVideoPlayer({ youtubeUrl, coverImage, previewClipUrl, playLabel }): JSX.Element`, used only by `work/[slug]/page.tsx`.

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/hero-video-player.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test:unit -- hero-video-player`
Expected: FAIL — `src/components/media/HeroVideoPlayer.tsx` does not exist yet (module not found).

- [ ] **Step 3: Create `HeroVideoPlayer`**

Create `src/components/media/HeroVideoPlayer.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { ImageAsset } from "@/types";
import { cn } from "@/lib/cn";
import { toYoutubeNoCookieEmbedUrl } from "@/lib/youtube";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";

/**
 * Inline hero video: a muted looping preview (or the cover image, when no
 * preview clip is set) with a Play overlay that crossfades into a live
 * YouTube embed on click — no dialog, no page jump. The preview layer is
 * never unmounted on click; it fades to opacity-0 so the iframe underneath
 * (already mounted, already loading) is revealed without a black flash,
 * then the local video is paused once the fade finishes.
 */
export function HeroVideoPlayer({
  youtubeUrl,
  coverImage,
  previewClipUrl,
  playLabel,
}: {
  youtubeUrl: string;
  coverImage: ImageAsset;
  previewClipUrl?: string;
  playLabel: string;
}) {
  const [isActive, setIsActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const embedUrl = toYoutubeNoCookieEmbedUrl(youtubeUrl);

  return (
    <div className="bg-bg-secondary relative aspect-video w-full overflow-hidden">
      {isActive && embedUrl && (
        <iframe
          src={embedUrl}
          title="YouTube video player"
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}

      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          isActive && "pointer-events-none opacity-0",
        )}
        onTransitionEnd={(event) => {
          if (isActive && event.propertyName === "opacity" && event.target === event.currentTarget) {
            videoRef.current?.pause();
          }
        }}
      >
        {previewClipUrl ? (
          <video
            ref={videoRef}
            src={previewClipUrl}
            poster={coverImage.url}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={coverImage.url}
            alt={coverImage.alt}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        )}

        <button
          type="button"
          onClick={() => setIsActive(true)}
          className="group absolute inset-0 flex items-center justify-center bg-bg/40"
        >
          <VisuallyHidden>{playLabel}</VisuallyHidden>
          <span
            aria-hidden="true"
            className="border-accent bg-bg/70 flex h-16 w-16 items-center justify-center rounded-full border transition-transform group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          >
            <svg viewBox="0 0 24 24" className="text-accent h-6 w-6" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          {previewClipUrl && (
            <span
              aria-hidden="true"
              className="bg-bg/70 absolute right-4 bottom-4 flex h-8 w-8 items-center justify-center rounded-full"
            >
              <svg viewBox="0 0 24 24" className="text-text h-4 w-4" fill="none">
                <path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" />
                <path
                  d="M17 8l4 8M21 8l-4 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
```

Note the `onTransitionEnd` guard: the Play button's `<span>` icon also has a `transition-transform` (for the hover scale effect), which fires its own `transitionend` event that bubbles up to this handler. The `event.propertyName === "opacity" && event.target === event.currentTarget` check ensures the pause only happens for the outer container's own opacity transition, not a bubbled transform transition from a child.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm run test:unit -- hero-video-player`
Expected: PASS (all 3 tests)

- [ ] **Step 5: Wire `HeroVideoPlayer` into the project page and delete `VideoPlayerTrigger`**

Delete `src/components/media/VideoPlayerTrigger.tsx`.

In `src/app/[locale]/work/[slug]/page.tsx`, replace the import:

```tsx
import { VideoPlayerTrigger } from "@/components/media/VideoPlayerTrigger";
```

with:

```tsx
import { HeroVideoPlayer } from "@/components/media/HeroVideoPlayer";
```

Replace the video-with-`youtubeUrl` branch:

```tsx
      {project.type === "video" && project.youtubeUrl && (
        <VideoPlayerTrigger
          youtubeUrl={project.youtubeUrl}
          poster={project.coverImage}
          playLabel={t.project.playVideo}
          closeLabel={t.video.closeModal}
        />
      )}
```

with:

```tsx
      {project.type === "video" && project.youtubeUrl && (
        <HeroVideoPlayer
          youtubeUrl={project.youtubeUrl}
          coverImage={project.coverImage}
          previewClipUrl={project.previewClipUrl}
          playLabel={t.project.playVideo}
        />
      )}
```

The sibling `{project.type === "video" && !project.youtubeUrl && (...)}` branch (the static-only fallback) is untouched.

- [ ] **Step 6: Run the full unit suite and typecheck**

Run: `npm run test:unit && npm run typecheck`
Expected: PASS (all files, including the untouched `tests/unit/project-video-fallback.test.tsx` — its "youtubeUrl present" case still finds a `Play video` button, now rendered by `HeroVideoPlayer` instead of `VideoPlayerTrigger`)

- [ ] **Step 7: Commit**

```bash
git add src/components/media/HeroVideoPlayer.tsx src/components/media/VideoPlayerTrigger.tsx src/app/\[locale\]/work/\[slug\]/page.tsx tests/unit/hero-video-player.test.tsx
git commit -m "feat: replace project-page video poster+modal with an inline crossfade player"
```

---

### Task 4: Split the video e2e test

**Files:**
- Create: `tests/e2e/showreel-modal.spec.ts`
- Create: `tests/e2e/hero-video-player.spec.ts`
- Delete: `tests/e2e/video-modal.spec.ts`

**Interfaces:**
- Consumes: the homepage's "Watch Showreel" button (unchanged) and the project page's `HeroVideoPlayer` (Task 3).

- [ ] **Step 1: Create the showreel-only e2e test**

Create `tests/e2e/showreel-modal.spec.ts` with exactly the first test from the old file (unchanged — the homepage showreel button still opens `VideoModal`):

```ts
import { test, expect } from "@playwright/test";

/**
 * FR-003/FR-004/FR-014, SC-005: the homepage showreel button opens
 * VideoModal, and no request to youtube-nocookie.com fires until clicked.
 */
test.describe("Showreel modal", () => {
  test("showreel modal defers the YouTube request until opened, then closes via control and Escape", async ({
    page,
  }) => {
    const youtubeRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("youtube-nocookie.com")) youtubeRequests.push(request.url());
    });

    await page.goto("/en");
    expect(youtubeRequests).toHaveLength(0);

    await page.getByRole("button", { name: "Watch Showreel" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("iframe")).toHaveAttribute("src", /youtube-nocookie\.com/);
    expect(youtubeRequests.length).toBeGreaterThan(0);

    await dialog.getByRole("button", { name: /close/i }).click();
    await expect(dialog).not.toBeVisible();

    await page.getByRole("button", { name: "Watch Showreel" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
```

- [ ] **Step 2: Create the project-page inline-morph e2e test**

Create `tests/e2e/hero-video-player.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

/**
 * FR-003/FR-004/FR-014: a video project's hero player defers the YouTube
 * request until Play is clicked, then plays inline — no dialog, the iframe
 * appears directly on the page.
 */
test.describe("Hero video player", () => {
  test("a video project's player defers the YouTube request until clicked, then plays inline with no dialog", async ({
    page,
  }) => {
    const youtubeRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("youtube-nocookie.com")) youtubeRequests.push(request.url());
    });

    await page.goto("/en/work/first-glimpse");
    expect(youtubeRequests).toHaveLength(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await page.getByRole("button", { name: /play video/i }).click();

    await expect(page.locator('iframe[src*="youtube-nocookie.com"]')).toBeVisible();
    expect(youtubeRequests.length).toBeGreaterThan(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});
```

- [ ] **Step 3: Delete the old combined test file**

Delete `tests/e2e/video-modal.spec.ts`.

- [ ] **Step 4: Run the e2e suite**

Run: `npm run test:e2e`
Expected: PASS — both new spec files green. Note: the old combined file being replaced pointed its project-page test at `/en/work/the-withshaw-case`, which per `src/data/seed.ts` has no `youtubeUrl` set (it shows the static-only fallback from the prior cycle, no Play button) — that test would already have been failing on `master`. `first-glimpse` (used above) does have a `youtubeUrl` set in seed data.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/showreel-modal.spec.ts tests/e2e/hero-video-player.spec.ts tests/e2e/video-modal.spec.ts
git commit -m "test: split video-modal e2e spec into showreel-modal and hero-video-player"
```

---

### Task 5: Studio content-authoring descriptions

**Files:**
- Modify: `sanity/schemaTypes/project.ts`
- Modify: `sanity/schemaTypes/profile.ts`
- Modify: `sanity/schemaTypes/siteSettings.ts`

No test — this is pure content-authoring text added to Sanity Studio field definitions; it changes no data shape, validation, or component behavior, so nothing in `npm run test:unit` exercises it. Verify by running the existing suite once at the end (Step 4) to confirm nothing broke.

- [ ] **Step 1: Add descriptions to `sanity/schemaTypes/project.ts`**

Add a `description` line to each of these five fields (none currently have one). Each is a one-line addition to an existing `defineField({...})` call — add `description: "..."` as a new property in the object literal, alongside `name`/`title`/`type`:

- `type` field: `description: "Drives which fields below apply and how this project displays across the site (Video vs Photo) — pick this first."`
- `title` field: `description: "Shown as the page heading and in Work list cards. Fill in at least one language; the other language falls back to whichever one is filled."`
- `coverImage` field: `description: "The main thumbnail — used on Work list cards, homepage previews, and as the poster before a video is played."`
- `description` field (the project's own body-text field, `name: "description"`): `description: "A short paragraph shown under the title on the project's own page. Keep it to 1–3 sentences."`
- `featured` field: `description: "Shows this project in the homepage's Selected Work section. Turn off for projects you only want listed on the Work page."`

- [ ] **Step 2: Add descriptions to `sanity/schemaTypes/profile.ts`**

Add a `description` line to each of these eight fields:

- `name` field: `description: "Short brand name shown in the site header and footer (e.g. \"YERRMAK\")."`
- `fullName` field: `description: "Full name, shown on the About page and used as the portrait's alt text."`
- `tagline` field: `description: "One-line description shown under the name on the homepage/About page."`
- `biography` field: `description: "The paragraph shown on the About page, next to the portrait."`
- `portrait` field: `description: "Photo shown on the About page next to the biography."`
- `email` field: `description: "Shown as a clickable mail icon in the \"Get in touch\" section — this site has no contact form."`
- `instagramUrl` field: `description: "Full profile URL (e.g. https://www.instagram.com/yerrmak/) — shown as an icon in \"Get in touch\"."`
- `youtubeUrl` field: `description: "Full channel URL — shown as an icon in \"Get in touch\". This is your channel, not a specific project's video link."`

- [ ] **Step 3: Add a description to `sanity/schemaTypes/siteSettings.ts`**

Add a `description` line to the `contactCtaText` field:

- `contactCtaText` field: `description: "Heading shown above the \"Get in touch\" button on the homepage (e.g. \"Let's create something\")."`

- [ ] **Step 4: Run the full unit suite and typecheck**

Run: `npm run test:unit && npm run typecheck`
Expected: PASS, no errors (a Studio-only content change; nothing in the app or test suite reads Sanity Studio field descriptions)

- [ ] **Step 5: Commit**

```bash
git add sanity/schemaTypes/project.ts sanity/schemaTypes/profile.ts sanity/schemaTypes/siteSettings.ts
git commit -m "docs: add Studio field descriptions across project, profile, and siteSettings schemas"
```
