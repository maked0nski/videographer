<!--
Sync Impact Report
Version change: [TEMPLATE] → 1.0.0 (initial ratification)
Modified principles: n/a (first version)
Added sections:
  - I. Code Quality
  - II. Testing Standards
  - III. User Experience Consistency
  - IV. Performance Requirements
  - Technology & Content Constraints
  - Development Workflow & Non-Technical Content Ownership
  - Governance
Removed sections: n/a (first version)
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ compatible (Constitution Check gate is generic, reads this file directly)
  - .specify/templates/spec-template.md ✅ compatible (no hardcoded principle references)
  - .specify/templates/tasks-template.md ✅ compatible (no hardcoded principle references)
  - .specify/templates/checklist-template.md ✅ compatible
Follow-up TODOs: none
-->

# YERRMAK Portfolio Constitution

## Core Principles

### I. Code Quality

TypeScript strict mode (`strict: true`) is mandatory across the codebase; `any` is
not permitted without an inline comment justifying why a precise type is
infeasible. Content and data MUST be separated from presentation: components
render typed data (`Project`, `Profile`, `SiteSettings`) passed in as props or
fetched through a typed data layer — no hardcoded copy or project data lives
inside a component. This separation is what lets the data layer move from
static seed data to Sanity CMS without touching UI code. Project cards,
galleries, and modals (YouTube modal, photo lightbox) MUST be built as single
reusable components shared across Home, Work, and Project pages, not
duplicated per page. Lint and formatting checks MUST pass before merge.

**Rationale**: A portfolio site with bilingual routing and a future CMS swap
lives or dies on how cleanly data and presentation are separated; strict types
and shared components are what make that swap (and future project additions)
safe without a developer re-reviewing every page.

### II. Testing Standards

Automated tests MUST cover these critical user flows before a change touching
them can merge: language switching between `/ua` and `/en` (route and content
both translate correctly), Work filtering between All/Films/Photography
(driven by each project's `type` field), the YouTube video modal (opens,
closes, and does not load the iframe until opened), the photo lightbox (open,
close, navigate), and responsive layout on mobile and desktop breakpoints. A
manual device/browser pass (Android Chrome, Samsung Internet, iPhone Safari,
desktop Chrome/Edge/Firefox/Safari) is required before any production release,
covering the full scenario list: open home, play and close showreel, open
mobile menu, switch language and verify translation on every page, filter
Work, open a video project, open a photo project, use the lightbox, and add a
new project of each type through the CMS.

**Rationale**: These are the flows a non-technical site owner and site
visitors will actually exercise; everything else on the site is lower-risk
static content.

### III. User Experience Consistency

The site uses a single dark cinematic theme with one lime accent color
(`#C3CB00`) reserved for accent details only — logo, heading underline, active
nav state, hover states — never large filled areas. Spacing and typography are
defined once as shared design tokens (Tailwind theme configuration) and reused
identically across every page and both languages; no page or locale gets
one-off spacing or type styles. All interactive elements (navigation, filters,
modal, lightbox, links) MUST be fully keyboard-navigable with a visible focus
state. `prefers-reduced-motion` MUST be honored: any transition or animation
is disabled or reduced when the user has that preference set.

**Rationale**: A cinematic brand reads as sloppy the moment spacing, type, or
the accent color drifts between pages or languages; accessibility and reduced
motion are non-negotiable baseline behavior, not enhancements.

### IV. Performance Requirements

Mobile load time is the primary performance budget, since the site's audience
is expected to browse largely on phones. YouTube embeds (showreel and
per-project videos) MUST NOT load the actual iframe until the user interacts
with the video (click) — a thumbnail or poster is shown until then. Images
MUST be optimized and lazy-loaded (e.g. via `next/image`), served at
responsive sizes in modern formats. The hero background video MUST show its
poster image instantly and MUST NOT block page render; it starts playing once
buffered, using standard `<video poster>` behavior rather than custom
preloading logic.

**Rationale**: A slow-loading cinematic showcase defeats its own purpose —
visitors judging a videographer's work will not wait for unoptimized media to
load, and the hero is the first and highest-risk offender.

## Technology & Content Constraints

- Next.js App Router with a `[locale]` route segment for `/ua` and `/en` from
  the first commit — bilingual routing is not retrofitted later.
- TypeScript everywhere, strict mode, per Principle I.
- Tailwind CSS for styling, with colors, typography, and spacing defined as
  shared theme tokens per Principle III.
- The content/data layer is strictly typed (`Project`, `Profile`,
  `SiteSettings`) and starts as static seed data drawn from the site owner's
  real existing content (biography and initial project set), later replaced
  by Sanity CMS GROQ queries behind the same types — component code does not
  change when that swap happens.
- Every project has one `type` field (Video or Photo) that drives both the
  Work page filter and which page layout renders (YouTube player + BTS
  gallery for Video, photo gallery + lightbox for Photo) — there is no
  separate category field to keep in sync with `type`.
- Every language-dependent field (UI strings, project title/description,
  biography) has separate `uk` and `en` values.
- Optional project fields (YouTube URL, gallery, location, role,
  producer/director, recognition/stats) MUST NOT break rendering when absent
  — the corresponding section simply does not render.
- No contact form, no authentication, no e-commerce/booking/CRM features are
  in scope; contact is direct links only (email, Instagram, YouTube).

## Development Workflow & Non-Technical Content Ownership

- The frontend is built and reviewed against the site owner's real seed
  content (existing projects and biography) before the CMS is wired up, so
  design and UX decisions are validated against real content, not
  placeholders.
- The site owner is not technical. He MUST be able to add, edit, reorder, and
  translate projects, and switch a project between Video and Photo type,
  entirely through the CMS's content interface — no code change and no
  developer involvement required for routine content updates.
- The CMS form for a project exposes a single Type choice (Video/Photo) that
  determines which fields are shown and which rendering path is used; this
  keeps the content workflow to one decision instead of several fields that
  could contradict each other.
- Publishing a change in the CMS updates the live site automatically via
  webhook-triggered revalidation — the site owner never opens a deployment
  dashboard for a routine content change.

## Governance

This constitution supersedes ad hoc practice for this project. Any pull
request or change that conflicts with a principle above must either be
brought into compliance or record an explicit, reviewed justification in the
relevant plan's Complexity Tracking section — silent violations are not
permitted.

**Amendments**: propose the change, update this file with an incremented
version and a Sync Impact Report (as the HTML comment at the top of this
file), update any dependent template (`plan-template.md`, `spec-template.md`,
`tasks-template.md`, `checklist-template.md`) that the change affects, then
merge.

**Versioning policy** (semantic versioning applied to governance):
MAJOR — backward-incompatible removal or redefinition of a principle; MINOR —
a new principle or materially expanded guidance is added; PATCH — wording,
typo, or non-semantic clarification.

**Compliance review**: the Constitution Check gate in
`.specify/templates/plan-template.md` MUST be evaluated before Phase 0
research and re-checked after Phase 1 design for every feature plan.

**Version**: 1.0.0 | **Ratified**: 2026-07-10 | **Last Amended**: 2026-07-10
