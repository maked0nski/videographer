# Phase 0 Research: Bilingual Portfolio Website (YERRMAK)

All technical decisions below were specified directly by the project owner (see
`plan.md` Technical Context) rather than left open, so this document records the
rationale and alternatives considered for traceability instead of resolving
`NEEDS CLARIFICATION` markers — there are none outstanding.

## 1. Rendering & routing framework

- **Decision**: Next.js App Router, TypeScript, deployed on Vercel.
- **Rationale**: First-class support for the `[locale]` segment pattern needed for
  FR-018/FR-019, built-in ISR/on-demand revalidation matching the webhook-driven
  publish flow (FR-025), and `next/image` gives the optimization/lazy-loading behavior
  FR-029 requires without extra tooling. Vercel's free Hobby plan covers this project's
  scale (spec Assumptions: single owner, ~6 launch projects, portfolio-level traffic).
- **Alternatives considered**: Astro (strong for content sites, but weaker fit for the
  interactive modal/lightbox/filter pieces without added client-framework islands
  complexity); plain client-rendered SPA (rejected — hurts SEO/hreflang needs called out
  in the source roadmap and delays hero content visibility, conflicting with Principle
  IV/SC-004).

## 2. Bilingual routing strategy

- **Decision**: A `[locale]` route segment producing real, crawlable `/uk` and `/en`
  paths; no client-side-only language toggle. `uk` (not `ua`) is the locale code
  throughout the codebase and URLs — `uk` is the ISO 639-1 language code for
  Ukrainian, which is what `hreflang` and locale-negotiation logic require; `ua` is
  the (unrelated) ISO 3166-1 country code for Ukraine.
- **Rationale**: Directly satisfies FR-018 ("its own distinct URL path") and FR-020
  (switching language on a project page must land on that same project in the other
  locale — only possible if both locales are addressable, indexable routes). Also
  matches the constitution's Technology Constraints section verbatim. Using the
  correct ISO 639-1 code avoids emitting incorrect `hreflang="ua"` tags, which
  browsers and search engines would not recognize as Ukrainian.
- **Alternatives considered**: Cookie/localStorage-based language toggle with no URL
  change (rejected — explicitly excluded by the user's technical input and fails
  FR-018); query-string locale (`?lang=ua`) (rejected — weaker SEO/shareability, worse
  hreflang support).

## 3. Locale detection for the bare root path

- **Decision**: A Next.js middleware (`src/middleware.ts`) intercepts requests to `/`
  (no locale prefix), parses the visitor's `Accept-Language` header, and issues a
  redirect to `/uk` when Ukrainian is the best-matching preference, otherwise to `/en`.
  Any request the middleware cannot confidently match (missing header, no overlap with
  `uk`/`en`, malformed header) falls back to `/en`.
- **Rationale**: Directly implements spec User Story 2 / Acceptance Scenario 3 ("a
  visitor opens the site root without a language path... they are directed to one of
  the two supported language paths"), which intentionally left the exact mechanism
  unspecified as a technology-agnostic requirement. `Accept-Language` matching is a
  one-time, header-only check at the edge — no client-side flash of the wrong locale,
  no extra round trip, and no geo-IP dependency (which would guess by location, not
  language preference, and isn't reliable for a UK-based Ukrainian creator's
  audience).
- **Alternatives considered**: Always defaulting to one fixed locale regardless of
  browser preference (rejected — ignores an available, reliable signal for no
  reason); IP-based geolocation (rejected — location doesn't imply language,
  especially for a diaspora/international audience, and adds a paid or
  privacy-sensitive lookup this project doesn't otherwise need); client-side
  `navigator.language` detection after an initial render (rejected — causes a
  visible flash of the fallback locale before redirecting, which a middleware
  redirect avoids entirely).

## 4. Content management

- **Decision**: Sanity CMS (free plan), with `Project`, `Profile`, and `Site Settings`
  document types. `Project` has one `type` field (`video` | `photo`) that conditionally
  reveals relevant fields in Studio and drives both frontend rendering and the Work-page
  filter.
- **Rationale**: Directly implements constitution requirement "single Type choice...
  determines which fields are shown and which rendering path is used" and spec FR-009 /
  FR-023. Sanity's Studio is customizable enough to hide irrelevant fields per type
  (e.g. hide "YouTube URL" when `type = photo`) without building a custom admin UI —
  critical for the non-technical-owner requirement (FR-022/FR-024).
- **Alternatives considered**: A hand-rolled admin UI backed by a database (rejected —
  far more build/maintenance cost for a single-owner portfolio, no free hosted
  editorial UI); Markdown/MDX content in the repo (rejected — every edit would require
  a code change or PR, directly violating FR-025 and the constitution's "without
  touching code" requirement); Contentful/Storyblok (viable alternatives, but the
  owner's technical input specifies Sanity and its conditional-field Studio pattern is
  a good fit).

## 5. Media pipeline

- **Decision**: Project cover images and galleries stored as Sanity assets, served
  through Sanity's image CDN URL builder into `next/image` for responsive
  sizes/WebP/AVIF/lazy loading (FR-029). YouTube videos are links (not uploaded files),
  embedded via `youtube-nocookie.com` inside `VideoModal`, with the iframe element only
  created after the visitor clicks play (FR-014, SC-005). The hero background clip is a
  small, self-hosted, muted, looping asset in `public/` — not a Sanity asset — paired
  with a static poster image so it renders before the video buffers (constitution
  Principle IV, FR-002, SC-004).
- **Rationale**: Keeping the hero clip out of Sanity avoids CMS asset-CDN cold-start
  latency on the single most performance-sensitive asset on the site and keeps it under
  direct Vercel static-asset caching. Deferring the YouTube iframe avoids loading
  YouTube's tracking/player script on every page view — required by FR-014 and good for
  the mobile performance budget (Technical Context Performance Goals).
- **Alternatives considered**: Hosting the hero clip on Sanity/Mux (rejected — adds a
  network hop and CDN dependency to the one asset that must appear "instantly"); a
  YouTube player library (e.g. `react-youtube`) (rejected — pulls in the YouTube
  iframe API eagerly in most implementations, working against the deferred-load
  requirement; a plain on-demand iframe is simpler and satisfies FR-014 directly).

## 6. Publish → live update flow

- **Decision**: Sanity webhook → a Next.js API route (`app/api/revalidate/route.ts`)
  that triggers on-demand ISR revalidation for the affected locale paths.
- **Rationale**: Implements FR-025 and the constitution's "publishing a change...
  updates the live site automatically... the site owner never opens a deployment
  dashboard." No manual `vercel deploy` step is ever required for content changes.
- **Alternatives considered**: Full static export rebuilt on a schedule (rejected — adds
  publish latency and doesn't satisfy "automatically" as tightly); client-side
  fetch-at-request-time with no caching (rejected — worse performance for a
  low-churn portfolio site, no benefit given ISR already solves freshness).

## 7. Testing strategy

- **Decision**: Playwright for the five constitution-mandated critical flows (language
  switching, Work filter, YouTube modal, photo lightbox, responsive mobile/desktop
  layout); Vitest + React Testing Library for component/unit-level tests; `tsc --noEmit`
  and ESLint as static gates before merge.
- **Rationale**: The mandated flows are fundamentally cross-component, browser-level
  interactions (modal open/close/Escape, viewport-driven layout, filter state driving
  visible DOM) — Playwright exercises them the way a real visitor would, which
  unit-level component tests alone cannot verify. Vitest/RTL covers the many smaller
  reusable components (ProjectCard, PrevNextNav, etc.) cheaply and quickly.
- **Alternatives considered**: Cypress (comparable capability to Playwright; Playwright
  chosen for built-in multi-browser/mobile-viewport emulation matching spec's "Android
  Chrome, Samsung Internet, iPhone Safari... Chrome, Edge, Firefox, Safari" test matrix
  more directly); testing only with Vitest/RTL and no browser-level E2E tool (rejected —
  cannot faithfully verify keyboard focus trapping in a modal, Escape-to-close, or real
  responsive layout behavior).

## 8. Analytics

- **Decision**: `@vercel/analytics` wired in from the first deploy.
- **Rationale**: Matches the user's technical input exactly ("Vercel Analytics enabled
  from the start") and the source roadmap's explicit "not deferred" decision; free
  within Vercel Hobby plan limits.
- **Alternatives considered**: Deferring analytics to a later phase (rejected — owner
  explicitly wants it from launch); a heavier third-party analytics suite (rejected —
  unnecessary cost/complexity for a portfolio site, and outside the free-tier
  constraint).

## 9. Accessibility & motion

- **Decision**: Keyboard focus management and visible focus states are implemented as
  shared primitives (`ui/` components, a shared focus-trap utility for modal/lightbox)
  rather than re-implemented per feature; `prefers-reduced-motion` is checked once via a
  shared CSS media query / hook and applied globally to transition/animation utility
  classes.
- **Rationale**: Directly required by constitution Principle III and spec FR-027/FR-028
  /SC-007/SC-008. Centralizing it avoids the common failure mode of one-off components
  forgetting focus states or motion handling.
- **Alternatives considered**: Per-component ad hoc focus/motion handling (rejected —
  higher risk of inconsistency, harder to verify in a single Playwright pass).

## 10. Free-tier limits

- **Decision**: Proceed on Vercel Hobby + Sanity free plan with no paid add-ons for
  launch scope.
- **Rationale**: At ~6 launch projects, a handful of images/galleries per project, and
  single-owner low-frequency publishing, usage is far under both platforms' free-tier
  request/bandwidth/dataset limits (per the source roadmap's explicit note that this
  "doesn't need special monitoring, but is worth knowing about").
- **Alternatives considered**: n/a — explicitly in scope as a constraint, not a decision
  point; revisit only if traffic or content volume grows materially beyond the
  documented Scale/Scope.
