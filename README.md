# YERRMAK Portfolio

Bilingual (`/uk`, `/en`) Next.js portfolio site for videographer/photographer YERRMAK.

Production: https://yerrmak.pp.ua

## Features

- Ukrainian and English versions with locale-aware routing
- Videography and photography project galleries (Film Stills, Behind the Scenes, Photo Gallery)
- Sanity CMS content layer with an embedded Studio (`/studio`)
- YouTube video integration via an inline player
- Responsive layout with accessible focus/scroll/motion handling
- Docker-based deployment

## Technology

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4
- Sanity CMS
- Vitest + React Testing Library (unit)
- Playwright (e2e)
- Docker, GitHub Actions, GHCR

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Without Sanity environment variables set, the site runs entirely on the seed
content in `src/data/seed.ts` (`src/lib/content/queries.ts` auto-detects and
falls back to it) — no Sanity project is required to develop or preview the
public pages.

## Environment variables

Copy `.env.example` to `.env.local` and fill in as needed:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public site URL used for metadataBase/OG/sitemap |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID (unset = seed content fallback) |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset name |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Sanity API version |
| `SANITY_API_READ_TOKEN` | Only required if the dataset is private |
| `SANITY_REVALIDATE_SECRET` | Shared secret for the Sanity webhook that calls `/api/revalidate` |

## Available scripts

```bash
npm run dev            # Next.js dev server
npm run build           # production build
npm run start            # serve the production build
npm run typecheck        # tsc --noEmit
npm run lint              # ESLint
npm run format:check      # Prettier check
npm run test:unit         # Vitest + React Testing Library
npm run test:e2e          # Playwright (starts a production build automatically)
```

## Sanity Studio

The frontend and Studio schema are built into the app (`sanity/schemaTypes/`,
`sanity/sanity.config.ts`, mounted at `/studio`). Once
`NEXT_PUBLIC_SANITY_PROJECT_ID` is set, `src/lib/content/queries.ts`
automatically reads from Sanity instead of the seed file — no code change
needed. The `Profile` and `Site Settings` singletons plus project documents
are managed from `/studio`.

## Docker

```bash
docker build -t yerrmak-portfolio .
docker run -p 3000:3000 --env-file .env.local yerrmak-portfolio
```

## Deployment

`master` pushes trigger `.github/workflows/docker-publish.yml`, which builds
and publishes the image to GHCR (tagged `latest` and the commit SHA), then
calls a Watchtower webhook to roll out the update on the production host.

## Sanity webhook

For live content updates, add a webhook in the Sanity project dashboard
(Settings → API → Webhooks) pointed at `https://<your-domain>/api/revalidate`,
filtered to the `project`, `profile`, and `siteSettings` document types on the
production dataset, using the same secret as `SANITY_REVALIDATE_SECRET`.

## Testing

```bash
npm run format:check && npm run lint && npm run typecheck && npm run test:unit && npm run build && npm run test:e2e
```

## License

© YERRMAK. All rights reserved.
