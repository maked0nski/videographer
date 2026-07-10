# Implementation Plan: Bilingual Portfolio Website (YERRMAK)

**Branch**: `001-yerrmak-portfolio` | **Date**: 2026-07-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-yerrmak-portfolio/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a bilingual (`/uk`, `/en`) Next.js portfolio site for videographer/photographer
YERRMAK with three sections (Home, Work, About & Contact), a Sanity-driven Project
model with a single video/photo `type` field controlling both the Work filter and
per-project rendering, deferred-load YouTube embeds and a self-hosted poster-first hero
video, and a content workflow letting the non-technical site owner manage everything
through Sanity Studio with automatic publish-to-live revalidation. Technical approach:
Next.js App Router (`[locale]` segment) + TypeScript + Tailwind CSS on Vercel, Sanity CMS
(free plan) as the sole content store, `next/image` + Sanity's image CDN for media,
webhook-triggered ISR revalidation, and Playwright + Vitest/RTL for the critical-flow
and component test coverage the constitution requires.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) on Next.js 15 (App Router), Node.js 20 LTS runtime (Vercel default)

**Primary Dependencies**: Next.js, React, Tailwind CSS, `next-sanity` / `@sanity/client` + `@sanity/image-url` (content + image CDN URLs), Sanity Studio (`sanity` package, embedded schema), `@vercel/analytics` (Vercel Analytics from day one), no video-player library — YouTube embedded via a plain `youtube-nocookie.com` iframe created on demand, hero video via a native `<video>` element

**Storage**: Sanity CMS (hosted, free plan) as the sole content store — `Project`, `Profile`, `Site Settings` documents; no relational/NoSQL database of our own. The hero background video is a static asset in `public/`, not a Sanity asset.

**Testing**: Playwright for the constitution-mandated critical-flow coverage (language switching, Work filter, YouTube modal, photo lightbox, responsive layout on mobile/desktop viewports); Vitest + React Testing Library for component/unit tests; `tsc --noEmit` and ESLint as static gates.

**Target Platform**: Web — responsive mobile and desktop browsers, deployed on Vercel (Hobby/free plan, serverless + edge functions, ISR)

**Project Type**: Web application (single Next.js codebase; Sanity is a managed external CMS accessed via API, not a custom backend service)

**Performance Goals**: Hero brand name/tagline/poster visible before the background video finishes loading, even on a simulated slow mobile connection (constitution Principle IV, spec SC-004); no YouTube iframe network request until the visitor clicks play (spec SC-005); good Core Web Vitals on mobile (target LCP < 2.5s, CLS near 0) as the practical proxy for spec's "fast mobile load" requirement

**Constraints**: Must stay within Vercel Hobby and Sanity free-plan limits (no paid infrastructure); no contact form or transactional email service — contact is `mailto:` + social links only; no video-player/heavy carousel dependency for the hero (native `<video poster>` only, per constitution Principle IV)

**Scale/Scope**: Small personal portfolio — ~6 projects at launch, one content owner, low/portfolio-level traffic; scope is the four pages (Home, Work, Project detail, About & Contact) × 2 locales plus the Sanity schema and revalidation webhook

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Constraint | Check | Status |
|---|---|---|
| I. Code Quality — TypeScript strict mode | `strict: true` in `tsconfig.json`; ESLint + `tsc --noEmit` as merge gates | PASS |
| I. Code Quality — content/presentation separation | All content (`Project`, `Profile`, `Site Settings`) flows through a typed `lib/sanity` data layer via GROQ; components only receive typed props, never fetch or hardcode content | PASS |
| I. Code Quality — reusable components | `ProjectCard`, `WorkFilter`, `VideoModal`, `PhotoGallery`/`Lightbox` each built once under `components/` and shared across Home/Work/Project pages | PASS |
| II. Testing Standards — critical flows covered | Playwright suite planned for exactly the five flows the constitution names (language switch, Work filter, video modal, lightbox, responsive layout) | PASS |
| III. UX Consistency — single accent, shared tokens | Tailwind theme centralizes color/spacing/type tokens; `#C3CB00` used only via token references, never a raw hex in component code | PASS |
| III. UX Consistency — keyboard nav, reduced motion | Focus-visible styles and `prefers-reduced-motion` handling planned as shared, not per-component, concerns (see data-model/quickstart) | PASS |
| IV. Performance — deferred YouTube load | Modal renders a click-to-load placeholder; the `youtube-nocookie.com` iframe is only created on interaction | PASS |
| IV. Performance — hero poster-first | Hero uses `<video poster preload="metadata" autoplay muted loop playsinline>` self-hosted clip; no custom preloading gate, matching the constitution's explicit instruction | PASS |
| Technology Constraints — `[locale]` from day one | App Router structure is `app/[locale]/...` from the first commit | PASS |
| Technology Constraints — single `type` field | Sanity `project` schema has one `type` (video/photo) field driving Studio conditional fields, the Work filter, and page rendering — no parallel category field | PASS |
| Technology Constraints — optional fields don't break rendering | Data layer types mark producer/director, recognition/stats, gallery, YouTube URL optional; components conditionally render each | PASS |
| Development Workflow — real content before CMS wiring | Task sequencing (Phase 2 `/speckit-tasks`) builds pages against the six seed projects and existing bio as static data first, then swaps the data layer to Sanity queries behind the same types | PASS (sequencing constraint, not an architecture conflict) |
| Development Workflow — non-technical content ownership | Sanity Studio conditional-fields-by-type + drag orderable list + webhook auto-revalidation directly implements this | PASS |
| Governance — no contact form / no auth / no e-commerce | Confirmed out of scope in Technical Context and Constraints above | PASS |

No violations identified; **Complexity Tracking is not needed** for this plan.

**Post-Phase 1 re-check**: `data-model.md` and `contracts/` were reviewed against the
table above after design — the single `type` field remains the sole driver of
Studio/rendering/filter behavior, optional fields (`producerDirector`, `recognition`,
video `gallery`) remain optional in the schema, and the webhook contract implements
automatic revalidation with no manual deploy step. No new violations introduced;
Constitution Check still **PASS**.

## Project Structure

### Documentation (this feature)

```text
specs/001-yerrmak-portfolio/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── contracts/            # Phase 1 output (/speckit-plan command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
  middleware.ts                 # bare "/" → Accept-Language detection → redirect to
                                 # /uk or /en (falls back to /en, research.md §3)
  app/
    [locale]/
      layout.tsx                # locale-aware root layout: header, footer, lang switcher
      page.tsx                  # Home
      work/
        page.tsx                # Work list + All/Films/Photography filter
        [slug]/
          page.tsx               # Project detail (video or photo layout)
      about/
        page.tsx                # About & Contact
      not-found.tsx             # Unpublished/unknown project slug
    api/
      revalidate/
        route.ts                # Sanity webhook receiver → path revalidation
  components/
    layout/                     # Header, Footer, LanguageSwitcher, MobileMenu
    home/                       # Hero, HeroVideo, ShowreelButton, SelectedWork,
                                 # PhotographyPreview, ContactCta
    portfolio/                  # ProjectCard, WorkFilter, ProjectMeta, PrevNextNav
    media/                      # VideoModal, PhotoGallery, Lightbox
    ui/                         # shared primitives (Button, FocusRing, VisuallyHidden)
  lib/
    sanity/                     # client.ts, queries.ts, image.ts (image-url builder)
    i18n/                       # locale config, dictionary loader, locale-path helpers
  types/                        # Project, Profile, SiteSettings (shared, CMS-agnostic)
  data/                         # seed.ts — the 6 real launch projects + bio, typed
                                 # identically to the Sanity-backed shape (Dev Workflow)
  messages/
    uk.json
    en.json
  styles/
    globals.css                 # Tailwind entry + design tokens (color/spacing/type)

sanity/
  schemaTypes/
    project.ts
    profile.ts
    siteSettings.ts
    index.ts
  sanity.config.ts              # Studio config, mounted at /studio

tests/
  e2e/                          # Playwright: the 5 constitution-mandated critical flows
  unit/                         # Vitest + React Testing Library: component tests

public/
  hero/
    hero-loop.mp4               # self-hosted, muted, looping hero clip
    hero-poster.jpg
```

**Structure Decision**: A single Next.js application repository, not a split
frontend/backend layout — Sanity is a managed external CMS reached over its API/CDN, so
there is no custom backend service to maintain beyond the one Next.js API route that
receives Sanity's revalidation webhook. Sanity Studio's schema and config live in the
same repo under `sanity/` for now (mounted at `/studio`) to keep the non-technical
owner's entire workflow — and the developer's — in one deployable unit; it can be split
into its own package later without affecting the frontend structure above.

## Complexity Tracking

*No entries — Constitution Check passed without violations.*
