# Quickstart: Validating the YERRMAK Portfolio Website

A runnable guide to prove the feature works end-to-end against the success criteria in
`spec.md`. Entity/field details are in `data-model.md`; query/webhook shapes are in
`contracts/`.

## Prerequisites

- Node.js 20 LTS, a package manager (`pnpm`/`npm`).
- A Sanity project + dataset (free plan) with the schema from `sanity/schemaTypes/`
  deployed, and at least the six real launch projects plus the `Profile` and
  `Site Settings` singletons populated (per spec Assumptions — real content, not
  placeholders).
- Environment variables set locally (`.env.local`) and in Vercel: Sanity project ID,
  dataset name, a read token if the dataset is private, and
  `SANITY_REVALIDATE_SECRET` (see `contracts/revalidate-webhook.md`).

## Setup

```bash
pnpm install
pnpm dev        # starts Next.js locally, http://localhost:3000
```

In a second terminal, if the Studio is embedded in this repo:

```bash
pnpm sanity dev   # or: visit /studio on the running Next.js app
```

## Automated validation

```bash
pnpm test:unit    # Vitest + React Testing Library — component-level checks
pnpm test:e2e     # Playwright — the 5 constitution-mandated critical flows
pnpm typecheck    # tsc --noEmit
pnpm lint         # ESLint
```

The Playwright suite (`tests/e2e/`) must include, at minimum, one spec per critical
flow: language switching, Work filter, YouTube video modal, photo lightbox, and
responsive layout across a mobile and a desktop viewport — these map directly to
constitution Principle II and spec User Stories 2-4.

## Manual validation scenarios

Each scenario below maps to specific acceptance criteria/success criteria in `spec.md`.

1. **Browse the portfolio** (User Story 1 / SC-001)
   - Open `/en/`. Confirm brand name, tagline, Selected Work preview, and contact CTA
     are visible.
   - From the homepage, reach any project's full detail page in ≤ 2 clicks.
   - Confirm the project page shows title, year, location, role, description, and (only
     when present in Sanity) producer/director and recognition/stats.

2. **Bilingual switch** (User Story 2 / SC-002)
   - On a project detail page under `/en/work/<slug>`, use the header language switcher.
   - Confirm you land on `/uk/work/<slug>` — the same project, fully translated, not the
     Work list or homepage.
   - Visit the bare site root with your browser's language set to Ukrainian; confirm it
     redirects to `/uk`. Set it to a language other than Ukrainian or English (or clear
     `Accept-Language`); confirm it falls back to `/en`.

3. **Work filter correctness** (SC-003)
   - Open `/en/work`. Count projects under "All".
   - Switch to "Films", then "Photography"; confirm the counts partition exactly and no
     project appears under the wrong tab, cross-checked against each project's `type`
     in Sanity.

4. **Hero performance** (SC-004, SC-005)
   - Using browser devtools network throttling (e.g. "Slow 4G"), reload `/en/`.
   - Confirm the brand name, tagline, and poster image are visible before the hero
     video finishes loading.
   - Open the showreel modal and a video project's page; confirm (via the Network
     panel) that no request to `youtube-nocookie.com` fires until you click play.

5. **Non-technical content update** (User Story 6 / SC-006)
   - In Sanity Studio, create a new project, choosing `type: video` (or `photo`); confirm
     only the relevant fields (YouTube URL vs. gallery) are shown.
   - Publish it. Within a few seconds (webhook → revalidate), confirm it appears on the
     live Work page and, if `featured`, on the homepage — without anyone running a
     deploy.
   - Reorder two existing projects in Studio; confirm the Work page and homepage
     preview reflect the new order after publish.

6. **Photo gallery + lightbox** (User Story 4)
   - Open a `type: photo` project. Confirm it shows a gallery, not a video player.
   - Open the lightbox from any image; confirm next/previous navigation and close
     (button and Escape key) all work.

7. **Accessibility** (SC-007, SC-008)
   - Using only Tab/Shift+Tab/Enter/Escape, reach and operate: header nav, language
     switcher, Work filter, a project card, the showreel modal, and the lightbox.
     Confirm a visible focus indicator at every stop.
   - Enable "reduce motion" at the OS level, reload the site, and confirm no
     transition/animation plays beyond the essential hero video.

8. **Responsive layout** (SC-009)
   - At a mobile viewport width and a desktop viewport width, confirm no page has
     horizontal overflow or broken navigation, for both `/uk` and `/en`.

## Expected outcome

All automated checks (`test:unit`, `test:e2e`, `typecheck`, `lint`) pass, and every
manual scenario above completes with the stated expected result. This is the gate
before moving from `/speckit-tasks` output into implementation review.
