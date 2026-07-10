# Phase 1 Data Model: Bilingual Portfolio Website (YERRMAK)

Source: spec.md Key Entities (`Project`, `Site Profile`), expanded with the `Site
Settings` document called for in the plan's Technical Context, and localized per FR-018
/FR-024. All localized fields use the shared shape `{ uk: string; en?: string }` (or
`{ uk?: string; en: string }` in the reverse case) — never a hard-required pair, so a
single missing translation degrades gracefully per FR-021 rather than breaking the page.

## Locale

```text
Locale = "uk" | "en"
Localized<T> = Record<Locale, T>   // application-layer type; CMS may store either
                                     // locale empty, never both
```

## Entity: Project

Represents a single film or photography work in the portfolio (spec Key Entities;
constitution "single Type choice" requirement; FR-009 through FR-015).

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | string | system | Sanity document id |
| `slug` | string | yes, unique | Shared across both locales — this is what makes FR-020 possible (switching language on a project page stays on the same project) |
| `type` | `"video" \| "photo"` | yes | The single field driving Studio conditional fields, the Work filter (FR-008/FR-009), and page rendering (FR-011/FR-012) |
| `title` | `Localized<string>` | yes (≥1 locale) | |
| `year` | string or number | yes | Displayed as-is; free text to support ranges like "2023–2024" |
| `location` | string | yes | Not localized — place names read the same in both languages in this project's real content |
| `role` | `Localized<string>` | yes (≥1 locale) | e.g. "Director of Photography" |
| `producerDirector` | `Localized<string>` | no | Optional credit line (FR-010) |
| `recognition` | `Localized<string>` | no | Free-text note — festival selection, view count, etc. (spec Assumptions) |
| `description` | `Localized<text>` | yes (≥1 locale) | Short description |
| `coverImage` | Sanity image | yes | Used on `ProjectCard` and as page hero image |
| `youtubeUrl` | string (URL) | required when `type = "video"`; hidden/unused when `type = "photo"` | Studio conditional field; validated as a YouTube URL |
| `gallery` | Sanity image[] | required (≥1) when `type = "photo"` (primary gallery); optional when `type = "video"` (behind-the-scenes set) | |
| `order` | integer | yes | Drives Work-page list order, homepage Selected Work order, and prev/next sequence (FR-013) |
| `featured` | boolean | yes, default `false` | Whether shown in the homepage Selected Work preview (FR-005) |
| `published` | boolean | yes, default `false` | Gates visibility on the live site independent of Sanity's draft system; unpublished/missing slugs resolve to the not-found state (spec Edge Cases) |

**Validation rules**:

- `type` must be exactly one of `video`/`photo` — no third state, no independent
  category field (FR-009, constitution Technology Constraints).
- When `type = "video"`: `youtubeUrl` required; `gallery` optional (behind-the-scenes).
- When `type = "photo"`: `gallery` required with at least one image; `youtubeUrl` field
  is hidden in Studio and ignored by the frontend for this project.
- `slug` unique across all projects, both locales resolve through the same slug.
- `title`, `role`, `description` each need at least one populated locale; a page render
  falls back to whichever locale is populated when the current locale's value is empty
  (FR-021), rather than failing.
- `producerDirector` and `recognition`, when empty/absent, cause the frontend to omit
  the corresponding label+value entirely (spec Edge Cases) — never render an empty
  field.
- `order` need not be globally unique; ties are broken by `_createdAt` for a stable
  sort.

**Derived/computed (not stored)**:

- Work-page filter counts (`All`/`Films`/`Photography`) — computed from `type` across
  all `published = true` projects, never stored (SC-003).
- Previous/next project — computed at render time from the `order`-sorted list of
  `published = true` projects of any type (spec doesn't scope prev/next to the same
  type only; it says "the portfolio's display order"). For a list with more than one
  project, navigation always wraps: the last project's "next" resolves to the first
  project, and the first project's "previous" resolves to the last — both directions
  are always populated. For a list with exactly one project, both `previous` and
  `next` resolve to nothing (there is nowhere to go — the project does not link to
  itself) (spec Edge Cases).

## Entity: Profile

Represents the site owner's public identity and contact details (spec Key Entities:
"Site Profile").

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | Brand name shown in the hero — "YERRMAK" — not localized |
| `fullName` | string | yes | "Viktor Yermakov" — attribution, not localized |
| `tagline` | `Localized<string>` | yes (≥1 locale) | Short professional tagline shown under the brand name in the hero (FR-001) |
| `biography` | `Localized<text>` | yes (≥1 locale) | About & Contact page body (FR-016) |
| `portrait` | Sanity image | yes | About & Contact page image (FR-016) |
| `email` | string (email) | yes | Rendered as a `mailto:` link only — no form (FR-017) |
| `instagramUrl` | string (URL) | yes | |
| `youtubeUrl` | string (URL) | yes | The channel link on About & Contact — distinct from a per-project `youtubeUrl` or the showreel URL |

**Validation rules**: singleton document (exactly one `Profile`); `email`,
`instagramUrl`, `youtubeUrl` are the only contact channels the site ever renders —
adding a new channel type requires a schema change, which is an intentional constraint
per FR-017/spec Assumptions (contact is limited to these three named channels).

## Entity: Site Settings

Site-wide settings that are not tied to "who the owner is" (Profile) or to any one
project — introduced in the plan's Technical Context alongside `Project` and `Profile`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `showreelUrl` | string (URL) | yes | The full showreel opened by the homepage hero button (FR-003) — distinct from any single project's video |
| `contactCtaText` | `Localized<string>` | yes (≥1 locale) | Homepage contact call-to-action copy (FR-007) |
| `seoTitle` | `Localized<string>` | no | Falls back to `Profile.name` + page title when absent |
| `seoDescription` | `Localized<string>` | no | Falls back to `Profile.tagline` when absent |

**Explicitly not in this document**: the hero background video file and its poster
image. Per the plan's Technical Context (`research.md` §5), those are self-hosted
static assets in `public/`, not Sanity-managed content — deliberately outside the
site owner's routine CMS workflow, since swapping the hero clip is an infrequent,
higher-touch asset change rather than the kind of content update FR-022 targets.

**Validation rules**: singleton document (exactly one `Site Settings`).

## State / lifecycle

- **Project**: `published: false` (default, e.g. while the owner drafts a new entry) →
  `published: true` (visible on the live site, included in filter counts and prev/next
  order). No further states — there is no separate "archived" state; unpublishing is
  the removal mechanism (spec Edge Cases: "deletes or unpublishes the last remaining
  photo project").
- **Profile / Site Settings**: no lifecycle — always-published singletons, edited in
  place.

## Relationships

- `Project` entities are flat and independent of one another; "previous/next" and
  "featured" are ordering/flagging concerns computed over the `Project` collection, not
  foreign-key relationships.
- `Profile` and `Site Settings` are both singletons referenced by every page (header/
  footer/contact use `Profile`; homepage hero/SEO defaults use `Site Settings`) but have
  no relationship to `Project` or to each other.
