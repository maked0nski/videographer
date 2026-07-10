---

description: "Task list template for feature implementation"
---

# Tasks: Bilingual Portfolio Website (YERRMAK)

**Input**: Design documents from `/specs/001-yerrmak-portfolio/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md (all present)

**Tests**: Included. The constitution mandates automated coverage for five critical
flows (language switching, Work filter, YouTube video modal, photo lightbox,
responsive layout) and `plan.md`'s Testing field commits to Playwright + Vitest/RTL —
so test tasks are generated, one Playwright spec per mandated flow plus targeted Vitest
unit tests for security- and correctness-sensitive logic.

**Organization**: Tasks are grouped by user story (spec.md, P1–P6) to enable
independent implementation and testing of each story. Per the constitution's
Development Workflow principle, Stories 1–5 build the public site against real seed
data (`src/data/seed.ts`); Story 6 swaps the data layer to Sanity CMS behind the same
function signatures — no component built in Stories 1–5 changes when Story 6 lands.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Single Next.js application at the repository root, per `plan.md` Project Structure:
`src/` (app, components, lib, types, data, messages, styles), `sanity/`, `tests/`
(`e2e/`, `unit/`), `public/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create the Next.js (App Router) + TypeScript project scaffold matching `plan.md`'s Project Structure (`src/`, `sanity/`, `tests/`, `public/`) at the repository root
- [X] T002 [P] Configure TypeScript strict mode (`strict: true`) in `tsconfig.json` (constitution Principle I)
- [X] T003 [P] Install and configure Tailwind CSS with the entry stylesheet at `src/styles/globals.css`
- [X] T004 [P] Configure ESLint + Prettier for the project
- [X] T005 [P] Configure Vitest + React Testing Library for `tests/unit/`
- [X] T006 [P] Configure Playwright for `tests/e2e/`, with mobile and desktop viewport projects
- [X] T007 [P] Install and wire `@vercel/analytics` into the app
- [X] T008 Add `package.json` scripts (`dev`, `build`, `test:unit`, `test:e2e`, `typecheck`, `lint`) matching `quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Define shared entity types (`Project`, `Profile`, `SiteSettings`, `Locale`) in `src/types/` per `data-model.md`
- [X] T010 [P] Define Tailwind design tokens — colors (`#050505` background, `#0C0C0C` secondary background, `#F5F5F5` text, `#9A9A9A` secondary text, `#202020` border, `#C3CB00` accent), type scale (Space Grotesk/Manrope headings, Inter body) — in `tailwind.config.ts` / `src/styles/globals.css` (constitution Principle III)
- [X] T011 [P] Implement a shared `prefers-reduced-motion` utility/hook in `src/lib/` (constitution Principle III, `research.md` §9)
- [X] T012 [P] Implement shared UI primitives (`Button`, focus-visible ring) in `src/components/ui/`
- [X] T013 Implement `src/middleware.ts`: bare `/` → `Accept-Language` detection → redirect to `/uk` or `/en`, falling back to `/en` (`research.md` §3)
- [X] T014 [P] Implement `src/lib/i18n/` — locale config, dictionary loader, locale-path helpers
- [X] T015 [P] Create `src/messages/uk.json` and `src/messages/en.json` with base UI strings (nav, footer, common labels)
- [X] T016 Implement `src/app/[locale]/layout.tsx` (root locale layout wiring Header/Footer/LanguageSwitcher slots)
- [X] T017 [P] Implement `Header`, `Footer`, `MobileMenu` components in `src/components/layout/`
- [X] T018 Create `src/data/seed.ts` with the six real launch projects and the `Profile`/`Site Settings` content, typed per `data-model.md` (constitution Development Workflow: real content before CMS wiring)
- [X] T019 Implement `src/app/[locale]/not-found.tsx` (spec Edge Cases: unpublished/unknown project slug)

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Discover and browse the portfolio (Priority: P1) 🎯 MVP

**Goal**: A visitor can browse Home, the filterable Work list, and any project's detail page, all backed by real seed content.

**Independent Test**: Open the homepage, navigate to Work, open any project's detail page, and confirm title/year/location/role/description (and optional producer/director or recognition/stats when present) render correctly, with previous/next navigation working.

### Tests for User Story 1

- [X] T020 [P] [US1] Playwright test: Work filter "All"/"Films"/"Photography" counts exactly match each seed project's `type`, in `tests/e2e/work-filter.spec.ts` (SC-003)

### Implementation for User Story 1

- [X] T021 [P] [US1] Implement content query functions `getAllProjects`, `getProjectBySlug`, `getAdjacentProjects` in `src/lib/content/queries.ts`, backed by `src/data/seed.ts`, matching the shapes in `contracts/groq-queries.md` and the wraparound rule in `data-model.md`
- [X] T022 [P] [US1] Implement `ProjectCard` in `src/components/portfolio/ProjectCard.tsx`
- [X] T023 [P] [US1] Implement `WorkFilter` (All/Films/Photography) in `src/components/portfolio/WorkFilter.tsx` (FR-008, FR-009)
- [X] T024 [P] [US1] Implement `ProjectMeta` (title/year/location/role, omitting empty producer/director or recognition/stats) in `src/components/portfolio/ProjectMeta.tsx` (FR-010, spec Edge Cases)
- [X] T025 [P] [US1] Implement `PrevNextNav` with wraparound for 2+ projects and "nothing to link to" for exactly one project, in `src/components/portfolio/PrevNextNav.tsx` (FR-013, `data-model.md`)
- [X] T026 [P] [US1] Implement `HeroVideo` — poster-first, autoplay only once buffered, muted, loop — in `src/components/home/HeroVideo.tsx` (FR-001, FR-002, constitution Principle IV)
- [X] T027 [US1] Implement the Home page (hero, Selected Work preview, Contact CTA placeholder) in `src/app/[locale]/page.tsx` (FR-001, FR-005, FR-007) — depends on T021, T022, T026
- [X] T028 [US1] Implement the Work list page using `WorkFilter` + `ProjectCard` in `src/app/[locale]/work/page.tsx` (FR-008) — depends on T021, T022, T023
- [X] T029 [US1] Implement the Project detail page shell (`ProjectMeta`, `PrevNextNav`, type-based render branch) in `src/app/[locale]/work/[slug]/page.tsx` (FR-010, FR-013) — depends on T021, T024, T025

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Browse the site in Ukrainian or English (Priority: P2)

**Goal**: The whole site (Home, Work, every project page) is translated and reachable at `/uk` and `/en`, with a working language switcher and a sensible default for the bare root.

**Independent Test**: Load the site at `/uk`, confirm all visible text is Ukrainian, switch to English via the header switcher, and confirm the equivalent page loads fully in English.

### Tests for User Story 2

- [X] T030 [P] [US2] Playwright test: language switching preserves the current project across `/uk` ↔ `/en`, and the bare `/` redirects per `Accept-Language` (falling back to `/en`), in `tests/e2e/language-switching.spec.ts` (SC-002, FR-020)

### Implementation for User Story 2

- [X] T031 [P] [US2] Implement `LanguageSwitcher` — computes the equivalent path in the other locale, preserving the current project slug — in `src/components/layout/LanguageSwitcher.tsx` (FR-019, FR-020)
- [X] T032 [P] [US2] Populate `src/messages/uk.json` and `src/messages/en.json` with full Home/Work/Project/About copy (FR-018)
- [X] T033 [P] [US2] Add `uk`/`en` values for title/role/description on every seed project and for `Profile`/`Site Settings` fields in `src/data/seed.ts`; verify the content layer's fallback behavior against FR-021
- [X] T034 [P] [US2] Add `hreflang` alternate-locale link tags (using the `uk`/`en` codes) to `src/app/[locale]/layout.tsx` metadata

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Watch video work (Priority: P3)

**Goal**: The homepage showreel and a film project's embedded video + behind-the-scenes gallery are watchable, with the YouTube iframe deferred until interaction.

**Independent Test**: Open the homepage, play and close the showreel, then open a film project and play its embedded video and behind-the-scenes gallery.

### Tests for User Story 3

- [X] T035 [P] [US3] Playwright test: showreel modal opens/closes (close control and Escape key), and no request to `youtube-nocookie.com` fires until the visitor clicks play, in `tests/e2e/video-modal.spec.ts` (SC-005, FR-014)

### Implementation for User Story 3

- [X] T036 [P] [US3] Implement `VideoModal` — click-to-load `youtube-nocookie.com` iframe, close via control and Escape, body-scroll lock, focus trap — in `src/components/media/VideoModal.tsx` (FR-003, FR-004, FR-014)
- [X] T037 [P] [US3] Implement `ShowreelButton` on Home, wired to `VideoModal` and `Site Settings.showreelUrl`, in `src/components/home/ShowreelButton.tsx` (FR-003)
- [X] T038 [US3] Implement the Video-type branch of the Project detail page — embedded `VideoModal`/player trigger plus behind-the-scenes gallery grid — in `src/app/[locale]/work/[slug]/page.tsx` (FR-011) — depends on T036

**Checkpoint**: At this point, User Stories 1-3 should all work independently.

---

## Phase 6: User Story 4 - View photo work (Priority: P4)

**Goal**: A photography preview appears on Home once photo projects exist, the Work filter can isolate Photography, and a photo project's gallery opens in a lightbox.

**Independent Test**: Publish one photo project, confirm the homepage photography preview appears, filter Work to "Photography", open the project, and browse its gallery in the lightbox.

### Tests for User Story 4

- [X] T039 [P] [US4] Playwright test: photo lightbox opens from the gallery, navigates next/previous, and closes via both a close control and the Escape key, in `tests/e2e/photo-lightbox.spec.ts` (FR-015)

### Implementation for User Story 4

- [X] T040 [P] [US4] Implement `PhotoGallery` — responsive grid, `next/image` lazy-loaded — in `src/components/media/PhotoGallery.tsx` (FR-012, FR-029)
- [X] T041 [P] [US4] Implement `Lightbox` — next/previous navigation, close, keyboard support — in `src/components/media/Lightbox.tsx` (FR-015, FR-027)
- [X] T042 [US4] Implement the Photo-type branch of the Project detail page using `PhotoGallery` + `Lightbox` in `src/app/[locale]/work/[slug]/page.tsx` (FR-012) — depends on T040, T041
- [X] T043 [US4] Implement `PhotographyPreview` on Home, rendered only when at least one published photo project exists, in `src/components/home/PhotographyPreview.tsx` (FR-006, SC-010)
- [X] T044 [US4] Add at least one photo-type project to `src/data/seed.ts` so `PhotographyPreview` and the Photography filter are exercisable (spec Assumptions)

**Checkpoint**: At this point, User Stories 1-4 should all work independently.

---

## Phase 7: User Story 5 - Learn about YERRMAK and get in touch (Priority: P5)

**Goal**: A visitor can read the biography, see the portrait, and reach out via email, Instagram, or YouTube — no contact form anywhere.

**Independent Test**: Open the About & Contact page and confirm the biography, portrait, and each contact link are present and functional.

### Implementation for User Story 5

- [X] T045 [P] [US5] Implement the About & Contact page (portrait, biography, `mailto:`/Instagram/YouTube links, no form) in `src/app/[locale]/about/page.tsx` (FR-016, FR-017)
- [X] T046 [P] [US5] Implement `ContactCta` on Home, linking to the About & Contact page's contact section, in `src/components/home/ContactCta.tsx` (FR-007)
- [X] T047 [P] [US5] Vitest unit test: About & Contact renders `mailto:`/Instagram/YouTube links from `Profile` data and never renders a form, in `tests/unit/about-contact.test.tsx`

**Checkpoint**: At this point, User Stories 1-5 are complete — the full public site is functional on real seed content.

---

## Phase 8: User Story 6 - Manage portfolio content without a developer (Priority: P6)

**Goal**: The site owner manages every project (and Profile/Site Settings) through Sanity Studio — create, edit, reorder, translate, and switch project type — with changes going live automatically.

**Independent Test**: In Sanity Studio only, publish a new project (choosing Video or Photo), edit an existing project, reorder two projects, and add a missing translation; confirm each change appears correctly on the live site without a manual deploy.

### Implementation for User Story 6

- [X] T048 [US6] Define Sanity schema types (`project.ts`, `profile.ts`, `siteSettings.ts`) with type-conditional Studio fields in `sanity/schemaTypes/` per `data-model.md` (FR-023)
- [X] T049 [US6] Configure Sanity Studio (`sanity/sanity.config.ts`, mounted at `/studio`) with an orderable project list for reorder support (FR-022) — depends on T048
- [X] T050 [P] [US6] Implement `src/lib/sanity/client.ts` and `src/lib/sanity/image.ts` (image-url builder)
- [X] T051 [US6] Implement the GROQ query implementations in `src/lib/sanity/queries.ts` matching `contracts/groq-queries.md` (including the `getAdjacentProjects` wraparound / null-for-single-project rule) — depends on T048, T050
- [X] T052 [US6] Swap `src/lib/content/queries.ts` to call the `src/lib/sanity` implementations instead of `src/data/seed.ts`, keeping the same exported function signatures so no component from Stories 1-5 changes (constitution Development Workflow) — depends on T051
- [X] T053 [US6] Implement `POST /api/revalidate` in `src/app/api/revalidate/route.ts` per `contracts/revalidate-webhook.md` (signature verification, per-`_type` path revalidation) (FR-025)
- [X] T054 [P] [US6] Vitest unit test: the revalidate route returns 401 on an invalid signature and revalidates the correct paths per `_type`, in `tests/unit/revalidate-webhook.test.ts`
- [ ] T055 [US6] Configure the Sanity webhook (production dataset, `project`/`profile`/`siteSettings`) to call `/api/revalidate` with `SANITY_REVALIDATE_SECRET` — depends on T053
- [ ] T056 [US6] Migrate the six real launch projects and `Profile`/`Site Settings` content from `src/data/seed.ts` into the live Sanity dataset (spec Assumptions: real content, not placeholders) — depends on T048, T049

**Checkpoint**: All six user stories are independently functional; the site is fully owner-manageable via Sanity Studio, with no developer involvement required for routine content changes.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that span multiple user stories

- [X] T057 [P] Playwright test: responsive layout (no horizontal overflow or broken navigation) on mobile and desktop viewports, every page, both locales, in `tests/e2e/responsive-layout.spec.ts` (SC-009 — the fifth constitution-mandated critical flow)
- [X] T058 [P] Keyboard-only navigation and visible-focus audit across header nav, language switcher, Work filter, `VideoModal`, `Lightbox`, and contact links (SC-007, FR-027)
- [X] T059 [P] Verify `prefers-reduced-motion` disables or minimizes every transition site-wide, including the hero (SC-008, FR-028)
- [X] T060 [P] Add sitemap, `hreflang` tags for `/uk` ↔ `/en` pairs, `robots.txt`, favicon, and Open Graph/social preview metadata
- [ ] T061 [P] Run a mobile-network-throttled performance pass (Lighthouse/Core Web Vitals) confirming hero poster-before-video and no-YouTube-before-click hold in a production build (`plan.md` Performance Goals)
- [X] T062 Execute the full `quickstart.md` manual validation scenario list end-to-end and record results
- [ ] T063 Deploy to Vercel production; confirm Vercel Analytics events are recorded and webhook-triggered revalidation works against the live deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories.
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion.
  - Stories 1-5 are independent of each other and can proceed in parallel (if staffed) or sequentially in priority order (P1 → P2 → P3 → P4 → P5).
  - Story 6 (P6) depends on Stories 1-5 having built the public pages and `src/lib/content/queries.ts` interface it swaps the implementation behind (constitution Development Workflow: real content before CMS wiring).
- **Polish (Phase 9)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — no dependency on other stories.
- **User Story 2 (P2)**: Can start after Foundational — integrates with US1's pages (adds translation/switching) but is independently testable.
- **User Story 3 (P3)**: Can start after Foundational — adds to the Project detail page shell from US1 but is independently testable.
- **User Story 4 (P4)**: Can start after Foundational — adds to the Project detail page shell from US1 but is independently testable.
- **User Story 5 (P5)**: Can start after Foundational — fully independent page, no shared files with US1-4.
- **User Story 6 (P6)**: Should start after US1-5 exist, since it swaps the data-layer implementation those stories built against (`src/lib/content/queries.ts`) rather than replacing any of their component code.

### Within Each User Story

- Tests are written before the implementation tasks they validate.
- Data-layer/model tasks before components; components before pages.
- Core implementation before integration into shared files (e.g. the Project detail page shell from US1 is extended, not rebuilt, by US3 and US4).
- Story complete before moving to the next priority, if working sequentially.

### Parallel Opportunities

- All Setup tasks marked `[P]` can run in parallel.
- All Foundational tasks marked `[P]` can run in parallel (within Phase 2).
- Once Foundational completes, Stories 1, 2, 3, 4, and 5 can start in parallel (if team capacity allows); Story 6 should follow once those are in place.
- Within a story, all tasks marked `[P]` (different files, no unmet dependency) can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Launch the content-layer and component tasks for User Story 1 together (different files):
Task: "Implement content query functions in src/lib/content/queries.ts"
Task: "Implement ProjectCard in src/components/portfolio/ProjectCard.tsx"
Task: "Implement WorkFilter in src/components/portfolio/WorkFilter.tsx"
Task: "Implement ProjectMeta in src/components/portfolio/ProjectMeta.tsx"
Task: "Implement PrevNextNav in src/components/portfolio/PrevNextNav.tsx"
Task: "Implement HeroVideo in src/components/home/HeroVideo.tsx"

# Then, sequentially (each depends on the above):
Task: "Implement the Home page in src/app/[locale]/page.tsx"
Task: "Implement the Work list page in src/app/[locale]/work/page.tsx"
Task: "Implement the Project detail page shell in src/app/[locale]/work/[slug]/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently (browse Home/Work/Project on seed data)
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready.
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!).
3. Add User Story 2 (bilingual) → Test independently → Deploy/Demo.
4. Add User Story 3 (video) → Test independently → Deploy/Demo.
5. Add User Story 4 (photo) → Test independently → Deploy/Demo.
6. Add User Story 5 (about/contact) → Test independently → Deploy/Demo.
7. Add User Story 6 (Sanity CMS swap) → Test independently → Deploy/Demo — this is the point at which the non-technical site owner can take over routine content updates.
8. Polish (Phase 9) → Final production launch.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together.
2. Once Foundational is done:
   - Developer A: User Story 1, then User Story 6 (owns the content-layer interface end to end)
   - Developer B: User Story 2, then User Story 5
   - Developer C: User Story 3, then User Story 4
3. Stories 1-5 complete and integrate independently; Story 6 lands last, behind the same interface.

---

## Notes

- `[P]` tasks = different files, no dependencies.
- `[Story]` label maps task to specific user story for traceability.
- Each user story (1-5) is independently completable and testable against seed data; Story 6 is independently testable against an already-published portfolio, per its Independent Test in `spec.md`.
- Commit after each task or logical group.
- Stop at any checkpoint to validate a story independently.
- Avoid: vague tasks, same-file conflicts within a phase, cross-story dependencies that break independence (the one intentional exception being Story 6, which by design swaps the data-layer implementation behind Stories 1-5's interface).
