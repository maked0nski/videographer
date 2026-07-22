# Contract: Frontend ⇄ Sanity GROQ Queries

The only way `src/app` reads content is through the typed query functions in
`lib/sanity/queries.ts`. Every query returns data shaped exactly like the entities in
`data-model.md` (never raw Sanity portable-text/reference objects) — that boundary is
what keeps components decoupled from the CMS per constitution Principle I. All queries
filter to `published == true` except where noted.

## `getAllProjects(locale)`

- **Used by**: Work page (FR-008), homepage Selected Work (FR-005) and Photography
  preview (FR-006).
- **Returns**: `Project[]` ordered by `order`, with `title`/`role`/`description`
  resolved to the requested `locale` (falling back to the other locale per FR-021).
- **Shape** (per project): `{ slug, type, title, year, coverImage, featured }` — the
  list view never needs the full detail fields (gallery, producer/director, etc.).

## `getProjectBySlug(slug, locale)`

- **Used by**: Project detail page (FR-010 through FR-013).
- **Returns**: `Project | null` — `null` when the slug doesn't exist or
  `published != true`, which the page maps to the not-found state (spec Edge Cases).
- **Shape**: the full `Project` entity from `data-model.md`, locale-resolved.

## `getAdjacentProjects(slug, locale)`

- **Used by**: Previous/Next navigation on the Project detail page (FR-013).
- **Returns**: `{ previous: ProjectSummary | null; next: ProjectSummary | null }`,
  computed from the `order`-sorted, `published == true` list, locating the current
  project by `slug`. Looked up by `slug` rather than `order`: `order` (backed by the
  CMS's `orderRank` field) is unique by construction now, but slug remains the more
  direct key — this lookup used to be `order`-based and broke when two projects
  shared a value, back when `order` was a plain number editors typed in by hand.
  For a list with more than one project, navigation
  wraps and both fields are always non-`null`: the last project's `next` is the first
  project, and the first project's `previous` is the last project. For a list with
  exactly one project, both `previous` and `next` are `null` — there is nowhere to go,
  and the query never returns the project as its own neighbor (spec Edge Cases,
  definitive as of this revision).
- **Shape** (`ProjectSummary`): `{ slug, title, coverImage }` — enough to render a
  prev/next link, not the full project.

## `getProfile(locale)`

- **Used by**: Header/footer (brand name), About & Contact page (FR-016), homepage
  About preview.
- **Returns**: the singleton `Profile` entity, locale-resolved.

## `getSiteSettings(locale)`

- **Used by**: Homepage hero contact CTA text and showreel button (FR-003/FR-007), SEO
  metadata.
- **Returns**: the singleton `Site Settings` entity, locale-resolved.

## Cross-cutting rules

- Every query is locale-aware but **not** locale-filtering — content is not duplicated
  per locale in Sanity; the query resolves each localized field to the requested locale
  at read time, falling back per FR-021.
- No query ever returns an unpublished (`published != true`) `Project` to the public
  site — draft content is only visible inside Sanity Studio itself.
- Query functions are the single point that would change if the CMS were ever swapped;
  no component or page imports `@sanity/client` directly.
