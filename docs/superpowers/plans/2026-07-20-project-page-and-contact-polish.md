# Project Page and Contact Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a cover-image fallback when a video project has no `youtubeUrl` yet, replace the About page's text contact list with a monochrome social-icon row (Instagram, YouTube, LinkedIn, Facebook, email), and lighten the site's near-black background.

**Architecture:** Three independent, additive changes to an existing Next.js App Router + Sanity CMS site. Content-model changes (two new optional Profile fields) flow through the existing seed/Sanity dual-implementation split (`src/lib/content/queries.ts` routes to `src/lib/content/seed-queries.ts` in dev/test, `src/lib/sanity/queries.ts` in production) — every consumer keeps reading the same `ResolvedProfile`/`ResolvedProject` shapes it already does. UI changes reuse existing patterns already in the codebase: the `VisuallyHidden` + inline-`<svg>` icon-button style from `CloseButton.tsx`, and the CSS custom-property color tokens in `globals.css`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 (`@theme` tokens), Sanity Studio v6 (`defineField`), Vitest + Testing Library for unit tests.

## Global Constraints

- Never hardcode a color as a raw hex value in a component — always consume the `--color-*` tokens from `src/styles/globals.css` (constitution Principle III, already-established rule in this codebase).
- `ResolvedProfile`/`ResolvedProject` are the only shapes any page/component may depend on — never import `src/lib/sanity/queries.ts` or `src/lib/content/seed-queries.ts` directly from a page (constitution Principle I; enforced today by `src/lib/content/queries.ts` being the sole router).
- New Profile fields (`linkedinUrl`, `facebookUrl`) are optional — no `validation: (r) => r.required()` in the Sanity schema, and the rendering must tolerate either being absent.
- The video cover-image fallback applies only when `youtubeUrl` is falsy (empty/missing) — a non-YouTube URL string is explicitly out of scope and must not change existing `VideoPlayerTrigger`/`VideoModal` behavior.
- All existing tests (`npm run test:unit`) must keep passing after every task.

---

### Task 1: Optional LinkedIn/Facebook URLs on Profile (schema, types, both query implementations)

**Files:**
- Modify: `sanity/schemaTypes/profile.ts`
- Modify: `src/types/profile.ts`
- Modify: `src/lib/content/seed-queries.ts`
- Modify: `src/lib/sanity/queries.ts`
- Test: `tests/unit/seed-queries-profile.test.ts` (new)

**Interfaces:**
- Produces: `Profile.linkedinUrl?: string`, `Profile.facebookUrl?: string`, `ResolvedProfile.linkedinUrl?: string`, `ResolvedProfile.facebookUrl?: string` — consumed by Task 2's `SocialLinks` component and the About page.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/seed-queries-profile.test.ts`:

```tsx
import { describe, expect, it, vi } from "vitest";

vi.mock("@/data/seed", () => ({
  profile: {
    name: "YERRMAK",
    fullName: "Viktor Yermakov",
    tagline: { en: "Tagline", uk: "Тег" },
    biography: { en: "Bio", uk: "Біо" },
    portrait: { url: "/portrait.jpg", alt: "Portrait", width: 1, height: 1 },
    email: "test@example.com",
    instagramUrl: "https://www.instagram.com/test",
    youtubeUrl: "https://www.youtube.com/@test",
    linkedinUrl: "https://www.linkedin.com/in/test",
    facebookUrl: "https://www.facebook.com/test",
  },
  projects: [],
  siteSettings: {
    showreelUrl: "",
    contactCtaText: { en: "", uk: "" },
  },
}));

import { getProfile } from "@/lib/content/seed-queries";

describe("getProfile (seed-backed)", () => {
  it("passes through optional linkedinUrl and facebookUrl when set", async () => {
    const profile = await getProfile("en");
    expect(profile.linkedinUrl).toBe("https://www.linkedin.com/in/test");
    expect(profile.facebookUrl).toBe("https://www.facebook.com/test");
  });

  it("omits linkedinUrl and facebookUrl when not set on the source profile", async () => {
    vi.doMock("@/data/seed", () => ({
      profile: {
        name: "YERRMAK",
        fullName: "Viktor Yermakov",
        tagline: { en: "Tagline", uk: "Тег" },
        biography: { en: "Bio", uk: "Біо" },
        portrait: { url: "/portrait.jpg", alt: "Portrait", width: 1, height: 1 },
        email: "test@example.com",
        instagramUrl: "https://www.instagram.com/test",
        youtubeUrl: "https://www.youtube.com/@test",
      },
      projects: [],
      siteSettings: { showreelUrl: "", contactCtaText: { en: "", uk: "" } },
    }));
    vi.resetModules();
    const { getProfile: getProfileFresh } = await import("@/lib/content/seed-queries");
    const profile = await getProfileFresh("en");
    expect(profile.linkedinUrl).toBeUndefined();
    expect(profile.facebookUrl).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test:unit -- seed-queries-profile`
Expected: FAIL — `expect(profile.linkedinUrl).toBe(...)` receives `undefined` because `getProfile` in `src/lib/content/seed-queries.ts` doesn't return `linkedinUrl`/`facebookUrl` yet (line ~85-96 today only returns `name, fullName, tagline, biography, portrait, email, instagramUrl, youtubeUrl`).

- [ ] **Step 3: Add the fields to the Sanity schema**

In `sanity/schemaTypes/profile.ts`, after the existing `youtubeUrl` field (currently the last field before the closing `],`), add:

```ts
    defineField({
      name: "linkedinUrl",
      title: "LinkedIn URL",
      type: "url",
      description: "Optional — the LinkedIn icon only appears on the site once this is filled in.",
    }),
    defineField({
      name: "facebookUrl",
      title: "Facebook URL",
      type: "url",
      description: "Optional — the Facebook icon only appears on the site once this is filled in.",
    }),
```

Note there is no `validation: (r) => r.required()` on these two — that's intentional (Global Constraints).

- [ ] **Step 4: Add the fields to the TypeScript types**

In `src/types/profile.ts`, add to both interfaces:

```ts
export interface Profile {
  name: string;
  fullName: string;
  tagline: Localized<string>;
  biography: Localized<string>;
  portrait: ImageAsset;
  email: string;
  instagramUrl: string;
  youtubeUrl: string;
  linkedinUrl?: string;
  facebookUrl?: string;
}

/** Locale-resolved shape handed to components. */
export interface ResolvedProfile {
  name: string;
  fullName: string;
  tagline: string;
  biography: string;
  portrait: ImageAsset;
  email: string;
  instagramUrl: string;
  youtubeUrl: string;
  linkedinUrl?: string;
  facebookUrl?: string;
}
```

- [ ] **Step 5: Thread the fields through the seed-backed query**

In `src/lib/content/seed-queries.ts`, update `getProfile`:

```ts
export async function getProfile(locale: Locale): Promise<ResolvedProfile> {
  return {
    name: profile.name,
    fullName: profile.fullName,
    tagline: resolveLocalized(profile.tagline, locale) ?? "",
    biography: resolveLocalized(profile.biography, locale) ?? "",
    portrait: profile.portrait,
    email: profile.email,
    instagramUrl: profile.instagramUrl,
    youtubeUrl: profile.youtubeUrl,
    linkedinUrl: profile.linkedinUrl,
    facebookUrl: profile.facebookUrl,
  };
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm run test:unit -- seed-queries-profile`
Expected: PASS (both tests)

- [ ] **Step 7: Thread the fields through the Sanity-backed query**

In `src/lib/sanity/queries.ts`, update the `SanityProfileDoc` interface and `getProfile`:

```ts
interface SanityProfileDoc {
  name: string;
  fullName: string;
  tagline: Localized<string>;
  biography: Localized<string>;
  portrait: SanityImageRef;
  email: string;
  instagramUrl: string;
  youtubeUrl: string;
  linkedinUrl?: string;
  facebookUrl?: string;
}
```

```ts
export async function getProfile(locale: Locale): Promise<ResolvedProfile> {
  const doc = await sanityClient.fetch<SanityProfileDoc>(`*[_id == "profile"][0]`);

  return {
    name: doc.name,
    fullName: doc.fullName,
    tagline: resolveLocalized(doc.tagline, locale) ?? "",
    biography: resolveLocalized(doc.biography, locale) ?? "",
    portrait: toImageAsset(doc.portrait, doc.fullName),
    email: doc.email,
    instagramUrl: doc.instagramUrl,
    youtubeUrl: doc.youtubeUrl,
    linkedinUrl: doc.linkedinUrl,
    facebookUrl: doc.facebookUrl,
  };
}
```

No GROQ projection change needed — `getProfile`'s query (`*[_id == "profile"][0]`) has no explicit field projection, so it already returns every field on the document, including the two new ones once they exist in Sanity.

- [ ] **Step 8: Run the full unit suite**

Run: `npm run test:unit`
Expected: PASS (all files, including the untouched `about-contact.test.tsx` and `revalidate-webhook.test.ts`)

- [ ] **Step 9: Typecheck**

Run: `npm run typecheck`
Expected: no errors

- [ ] **Step 10: Commit**

```bash
git add sanity/schemaTypes/profile.ts src/types/profile.ts src/lib/content/seed-queries.ts src/lib/sanity/queries.ts tests/unit/seed-queries-profile.test.ts
git commit -m "feat: add optional LinkedIn/Facebook URLs to Profile"
```

---

### Task 2: Social-icon row on the About page's "Get in touch" section

**Files:**
- Create: `src/components/about/SocialLinks.tsx`
- Modify: `src/app/[locale]/about/page.tsx`
- Modify: `src/messages/en.json`
- Modify: `src/messages/uk.json`
- Modify: `tests/unit/about-contact.test.tsx`

**Interfaces:**
- Consumes: `ResolvedProfile` (from Task 1: `email`, `instagramUrl`, `youtubeUrl` always present; `linkedinUrl?`, `facebookUrl?` optional).
- Produces: `SocialLinks({ profile, labels }): JSX.Element` where `labels: { email: string; instagram: string; youtube: string; linkedin: string; facebook: string }` — used only by `about/page.tsx`.

- [ ] **Step 1: Add new message keys**

In `src/messages/en.json`, inside the `"about"` object (after `"youtube": "YouTube"`), add:

```json
    "linkedin": "LinkedIn",
    "facebook": "Facebook"
```

So the `"about"` block reads:

```json
  "about": {
    "heading": "About & Contact",
    "contactHeading": "Get in touch",
    "email": "Email",
    "instagram": "Instagram",
    "youtube": "YouTube",
    "linkedin": "LinkedIn",
    "facebook": "Facebook"
  },
```

In `src/messages/uk.json`, same position:

```json
  "about": {
    "heading": "Про мене й контакти",
    "contactHeading": "Зв'язатися",
    "email": "Email",
    "instagram": "Instagram",
    "youtube": "YouTube",
    "linkedin": "LinkedIn",
    "facebook": "Facebook"
  },
```

- [ ] **Step 2: Write the failing test**

Replace the contents of `tests/unit/about-contact.test.tsx` with:

```tsx
import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage from "@/app/[locale]/about/page";

vi.mock("next/image", () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

const baseProfile = {
  name: "YERRMAK",
  fullName: "Viktor Yermakov",
  tagline: "Cinematographer",
  biography: "A short biography.",
  portrait: { url: "/profile/portrait.jpg", alt: "Portrait", width: 394, height: 525 },
  email: "yerrmakov@gmail.com",
  instagramUrl: "https://www.instagram.com/yerrmak",
  youtubeUrl: "https://www.youtube.com/@yerrmak",
};

describe("About & Contact page", () => {
  it("renders icon links for email/Instagram/YouTube and never a form, with LinkedIn/Facebook omitted when not set", async () => {
    vi.doMock("@/lib/content/queries", () => ({
      getProfile: vi.fn().mockResolvedValue(baseProfile),
    }));
    vi.resetModules();
    const { default: FreshAboutPage } = await import("@/app/[locale]/about/page");
    const element = await FreshAboutPage({ params: Promise.resolve({ locale: "en" }) });
    render(element);

    const emailLink = screen.getByRole("link", { name: /email/i });
    expect(emailLink).toHaveAttribute("href", "mailto:yerrmakov@gmail.com");

    const instagramLink = screen.getByRole("link", { name: /instagram/i });
    expect(instagramLink).toHaveAttribute("href", "https://www.instagram.com/yerrmak");

    const youtubeLink = screen.getByRole("link", { name: /youtube/i });
    expect(youtubeLink).toHaveAttribute("href", "https://www.youtube.com/@yerrmak");

    expect(screen.queryByRole("link", { name: /linkedin/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /facebook/i })).not.toBeInTheDocument();

    expect(screen.getByText("A short biography.")).toBeInTheDocument();
    expect(document.querySelector("form")).not.toBeInTheDocument();
  });

  it("renders LinkedIn and Facebook icon links when those URLs are set", async () => {
    vi.doMock("@/lib/content/queries", () => ({
      getProfile: vi.fn().mockResolvedValue({
        ...baseProfile,
        linkedinUrl: "https://www.linkedin.com/in/yerrmak",
        facebookUrl: "https://www.facebook.com/yerrmak",
      }),
    }));
    vi.resetModules();
    const { default: FreshAboutPage } = await import("@/app/[locale]/about/page");
    const element = await FreshAboutPage({ params: Promise.resolve({ locale: "en" }) });
    render(element);

    const linkedinLink = screen.getByRole("link", { name: /linkedin/i });
    expect(linkedinLink).toHaveAttribute("href", "https://www.linkedin.com/in/yerrmak");

    const facebookLink = screen.getByRole("link", { name: /facebook/i });
    expect(facebookLink).toHaveAttribute("href", "https://www.facebook.com/yerrmak");
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm run test:unit -- about-contact`
Expected: FAIL — the current `about/page.tsx` renders `<a>{t.about.email}: {profile.email}</a>` (link name is `"Email: yerrmakov@gmail.com"`, not just matching `/email/i` alone is actually fine for that one, but LinkedIn/Facebook links don't exist yet so `getByRole("link", { name: /linkedin/i })` in the second test throws `Unable to find role="link"`).

- [ ] **Step 4: Create the `SocialLinks` component**

Create `src/components/about/SocialLinks.tsx`:

```tsx
import type { ResolvedProfile } from "@/types";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";

const ICON_CLASS = "h-5 w-5";
const LINK_CLASS = "text-text-secondary hover:text-accent transition-colors";

function EmailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={ICON_CLASS} fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 7l8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={ICON_CLASS} fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="7" r="1" fill="currentColor" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={ICON_CLASS} fill="none">
      <rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9l6 3-6 3V9z" fill="currentColor" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={ICON_CLASS} fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="8.5" r="1.1" fill="currentColor" />
      <path d="M8 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M12 17v-4.2c0-1.4.9-2.3 2.1-2.3s2 .9 2 2.3V17M12 11.2h1.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={ICON_CLASS} fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M13.2 19v-6h2l.3-2.4h-2.3V8.9c0-.7.2-1.2 1.3-1.2h1.1V5.6c-.2 0-.9-.1-1.7-.1-2 0-3.3 1.2-3.3 3.4v1.7H8.8v2.4h1.8V19"
        fill="currentColor"
      />
    </svg>
  );
}

/** Monochrome icon row for the About page's "Get in touch" section — no
 * per-platform brand colors, matching the site's black/white/accent
 * aesthetic. LinkedIn/Facebook only render when their optional URL is set.
 */
export function SocialLinks({
  profile,
  labels,
}: {
  profile: ResolvedProfile;
  labels: { email: string; instagram: string; youtube: string; linkedin: string; facebook: string };
}) {
  return (
    <ul className="flex flex-wrap gap-5">
      <li>
        <a href={`mailto:${profile.email}`} className={LINK_CLASS}>
          <VisuallyHidden>{labels.email}</VisuallyHidden>
          <EmailIcon />
        </a>
      </li>
      <li>
        <a href={profile.instagramUrl} target="_blank" rel="noreferrer noopener" className={LINK_CLASS}>
          <VisuallyHidden>{labels.instagram}</VisuallyHidden>
          <InstagramIcon />
        </a>
      </li>
      <li>
        <a href={profile.youtubeUrl} target="_blank" rel="noreferrer noopener" className={LINK_CLASS}>
          <VisuallyHidden>{labels.youtube}</VisuallyHidden>
          <YoutubeIcon />
        </a>
      </li>
      {profile.linkedinUrl && (
        <li>
          <a href={profile.linkedinUrl} target="_blank" rel="noreferrer noopener" className={LINK_CLASS}>
            <VisuallyHidden>{labels.linkedin}</VisuallyHidden>
            <LinkedinIcon />
          </a>
        </li>
      )}
      {profile.facebookUrl && (
        <li>
          <a href={profile.facebookUrl} target="_blank" rel="noreferrer noopener" className={LINK_CLASS}>
            <VisuallyHidden>{labels.facebook}</VisuallyHidden>
            <FacebookIcon />
          </a>
        </li>
      )}
    </ul>
  );
}
```

- [ ] **Step 5: Wire `SocialLinks` into the About page**

In `src/app/[locale]/about/page.tsx`, replace the `import` list and the `<div id="contact">` block.

Replace:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Locale } from "@/types";
import { isLocale, getMessages, localizedAlternates } from "@/lib/i18n";
import { getProfile } from "@/lib/content/queries";
```

with:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Locale } from "@/types";
import { isLocale, getMessages, localizedAlternates } from "@/lib/i18n";
import { getProfile } from "@/lib/content/queries";
import { SocialLinks } from "@/components/about/SocialLinks";
```

Replace the `<div id="contact" ...>` block:

```tsx
          <div id="contact" className="border-border mt-12 border-t pt-8">
            <h2 className="text-xl font-semibold">{t.about.contactHeading}</h2>
            <ul className="mt-6 flex flex-col gap-4 text-sm">
              <li>
                <a href={`mailto:${profile.email}`} className="hover:text-accent transition-colors">
                  {t.about.email}: {profile.email}
                </a>
              </li>
              <li>
                <a
                  href={profile.instagramUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-accent transition-colors"
                >
                  {t.about.instagram}
                </a>
              </li>
              <li>
                <a
                  href={profile.youtubeUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-accent transition-colors"
                >
                  {t.about.youtube}
                </a>
              </li>
            </ul>
          </div>
```

with:

```tsx
          <div id="contact" className="border-border mt-12 border-t pt-8">
            <h2 className="text-xl font-semibold">{t.about.contactHeading}</h2>
            <div className="mt-6">
              <SocialLinks
                profile={profile}
                labels={{
                  email: t.about.email,
                  instagram: t.about.instagram,
                  youtube: t.about.youtube,
                  linkedin: t.about.linkedin,
                  facebook: t.about.facebook,
                }}
              />
            </div>
          </div>
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm run test:unit -- about-contact`
Expected: PASS (both tests)

- [ ] **Step 7: Run the full unit suite and typecheck**

Run: `npm run test:unit && npm run typecheck`
Expected: PASS, no errors

- [ ] **Step 8: Commit**

```bash
git add src/components/about/SocialLinks.tsx src/app/[locale]/about/page.tsx src/messages/en.json src/messages/uk.json tests/unit/about-contact.test.tsx
git commit -m "feat: replace About page contact list with monochrome social-icon row"
```

---

### Task 3: Cover-image fallback for video projects with no `youtubeUrl`

**Files:**
- Modify: `src/app/[locale]/work/[slug]/page.tsx`
- Test: `tests/unit/project-video-fallback.test.tsx` (new)

**Interfaces:**
- Consumes: `ResolvedProject` (`type`, `youtubeUrl?`, `coverImage: ImageAsset`) from `src/lib/content/queries.ts` (already in place, no change).

- [ ] **Step 1: Write the failing test**

Create `tests/unit/project-video-fallback.test.tsx`:

```tsx
import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

const baseProject = {
  slug: "the-withshaw-case",
  type: "video" as const,
  title: "The Withshaw Case",
  year: "2025",
  role: "Cinematographer",
  description: "A thriller-drama.",
  coverImage: { url: "/cover.jpg", alt: "The Withshaw Case cover", width: 1600, height: 1000 },
  order: 1,
  featured: true,
};

vi.mock("@/lib/content/queries", () => ({
  getProjectBySlug: vi.fn(),
  getAdjacentProjects: vi.fn().mockResolvedValue({ previous: null, next: null }),
}));

describe("Project detail page — video without youtubeUrl", () => {
  it("renders the cover image with no play button when youtubeUrl is missing", async () => {
    const { getProjectBySlug } = await import("@/lib/content/queries");
    vi.mocked(getProjectBySlug).mockResolvedValue(baseProject);
    const { default: ProjectPage } = await import("@/app/[locale]/work/[slug]/page");

    const element = await ProjectPage({
      params: Promise.resolve({ locale: "en", slug: "the-withshaw-case" }),
    });
    render(element);

    const coverImage = screen.getByAltText("The Withshaw Case cover");
    expect(coverImage).toHaveAttribute("src", "/cover.jpg");
    expect(screen.queryByRole("button", { name: /play video/i })).not.toBeInTheDocument();
  });

  it("renders the interactive VideoPlayerTrigger when youtubeUrl is present", async () => {
    const { getProjectBySlug } = await import("@/lib/content/queries");
    vi.mocked(getProjectBySlug).mockResolvedValue({
      ...baseProject,
      youtubeUrl: "https://www.youtube.com/watch?v=abc123",
    });
    const { default: ProjectPage } = await import("@/app/[locale]/work/[slug]/page");

    const element = await ProjectPage({
      params: Promise.resolve({ locale: "en", slug: "the-withshaw-case" }),
    });
    render(element);

    expect(screen.getByRole("button", { name: /play video/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test:unit -- project-video-fallback`
Expected: FAIL on the first test — `screen.getByAltText("The Withshaw Case cover")` throws because today nothing renders in that slot when `youtubeUrl` is missing (`src/app/[locale]/work/[slug]/page.tsx:54` guards on `project.youtubeUrl` and there is no `else` branch).

- [ ] **Step 3: Implement the fallback**

In `src/app/[locale]/work/[slug]/page.tsx`, add the `Image` import and the fallback branch.

Replace:

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Locale } from "@/types";
```

with:

```tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import type { Locale } from "@/types";
```

Replace:

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
        <VideoPlayerTrigger
          youtubeUrl={project.youtubeUrl}
          poster={project.coverImage}
          playLabel={t.project.playVideo}
          closeLabel={t.video.closeModal}
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run test:unit -- project-video-fallback`
Expected: PASS (both tests)

- [ ] **Step 5: Run the full unit suite and typecheck**

Run: `npm run test:unit && npm run typecheck`
Expected: PASS, no errors

- [ ] **Step 6: Commit**

```bash
git add src/app/[locale]/work/[slug]/page.tsx tests/unit/project-video-fallback.test.tsx
git commit -m "feat: show cover image fallback for video projects without a YouTube link"
```

---

### Task 4: Lighter background tokens

**Files:**
- Modify: `src/styles/globals.css`

No test — this is a pure design-token value change with no branching logic to verify; the codebase has no visual-regression tests for CSS values today, and adding one would be disproportionate to a two-line token edit.

- [ ] **Step 1: Update the tokens**

In `src/styles/globals.css`, inside the `@theme` block, replace:

```css
  --color-bg: #050505;
  --color-bg-secondary: #0c0c0c;
```

with:

```css
  --color-bg: #222222;
  --color-bg-secondary: #2a2a2a;
```

- [ ] **Step 2: Visual check**

Run: `npm run dev`, open `http://localhost:3000/en`, and confirm:
- The page background reads as a lighter charcoal gray, not near-black.
- Image placeholder blocks (e.g. the About page portrait frame, or the new video-fallback frame from Task 3) stay a shade lighter than the page background rather than blending into it or going darker.

- [ ] **Step 3: Run the full unit suite**

Run: `npm run test:unit`
Expected: PASS (unaffected by a CSS-only change)

- [ ] **Step 4: Commit**

```bash
git add src/styles/globals.css
git commit -m "style: lighten the near-black background tokens"
```

---

## Post-implementation note (content, not code)

Behind-the-scenes photos for a video project are already fully supported end-to-end by the existing `gallery` field on `project` documents in Sanity Studio (no change made in this plan). To make BTS photos appear on a live project page (e.g. The Withshaw Case), add images to that project's "Gallery" field in Studio and publish — the "Behind the Scenes" section already renders automatically once `gallery` has at least one image.
