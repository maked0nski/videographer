# YERRMAK Portfolio

Bilingual (`/uk`, `/en`) Next.js portfolio site for videographer/photographer
YERRMAK. See `specs/001-yerrmak-portfolio/` for the full spec, plan, and task
list this was built from.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Without Sanity environment variables set, the site runs entirely on the seed
content in `src/data/seed.ts` (`src/lib/content/queries.ts` auto-detects and
falls back to it) — no Sanity project is required to develop or preview the
public pages.

## Scripts

```bash
npm run dev          # Next.js dev server
npm run build         # production build
npm run start          # serve the production build
npm run typecheck      # tsc --noEmit
npm run lint            # ESLint
npm run format:check    # Prettier check
npm run test:unit       # Vitest + React Testing Library
npm run test:e2e        # Playwright (starts a production build automatically)
```

## Connecting Sanity CMS (Story 6 / T055-T056)

The frontend and Studio schema are already built (`sanity/schemaTypes/`,
`sanity/sanity.config.ts`, mounted at `/studio`). To go live on Sanity instead
of the seed data:

1. Create a Sanity project and dataset at <https://www.sanity.io/manage> (free
   plan is sufficient for this project's scale — see `research.md` §10).
2. Copy `.env.example` to `.env.local` and fill in
   `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, and (if the
   dataset is private) `SANITY_API_READ_TOKEN`. Set the same variables in
   Vercel's project settings for production.
3. Run `npm run dev`, open `/studio`, and create the `Profile` and
   `Site Settings` singleton documents, then the six real launch projects —
   use `src/data/seed.ts` as the content source (titles, roles, descriptions,
   the real email/YouTube channel) and replace every `TODO(owner)` field
   (exact years, locations, real YouTube video links, the approved biography
   copy) with the verified values from the current site.
4. Once `NEXT_PUBLIC_SANITY_PROJECT_ID` is set, `src/lib/content/queries.ts`
   automatically reads from Sanity instead of the seed file — no code change
   needed.
5. Generate a random secret for `SANITY_REVALIDATE_SECRET`, set it in Vercel,
   then in the Sanity project dashboard add a webhook (Settings → API →
   Webhooks) pointed at `https://<your-domain>/api/revalidate`, filtered to
   the `project`, `profile`, and `siteSettings` document types on the
   production dataset, with that same secret. See
   `specs/001-yerrmak-portfolio/contracts/revalidate-webhook.md` for the
   exact contract the route implements.

## Deploying

Deploy the repository to Vercel (Hobby plan is sufficient). Set the
environment variables from `.env.example` in the Vercel project settings
before the first deploy that should go live on Sanity content.
