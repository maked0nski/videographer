# Contract: Sanity → Next.js Revalidation Webhook

The one external interface this system exposes: an endpoint Sanity calls on every
publish so the live site updates without the owner touching Vercel (FR-025,
constitution "publishing... updates the live site automatically").

## `POST /api/revalidate`

**Caller**: Sanity's webhook delivery, configured against the production dataset for
`create`/`update`/`delete` on `project`, `profile`, and `siteSettings` documents.

**Authentication**: Sanity signs the request; the handler verifies the signature
against a shared secret stored as a Vercel environment variable
(`SANITY_REVALIDATE_SECRET`). Requests that fail verification are rejected with `401`
and trigger no revalidation.

**Request body** (Sanity webhook payload, relevant fields):

```json
{
  "_type": "project",
  "_id": "abc123",
  "slug": { "current": "the-withshaw-case" }
}
```

**Behavior**:

1. Verify the Sanity signature header; `401` and stop if invalid.
2. Branch on `_type`:
   - `project` → revalidate `/[locale]/work`, `/[locale]/`, and
     `/[locale]/work/[slug]` for both locales (the project may have entered/left the
     Selected Work or Photography preview, and its own detail page changed).
   - `profile` → revalidate `/[locale]/about` and `/[locale]/` (portrait/bio may appear
     in a homepage preview) for both locales.
   - `siteSettings` → revalidate `/[locale]/` for both locales (hero contact CTA text,
     showreel URL, SEO defaults).
3. Respond `200` with `{ "revalidated": true, "paths": [...] }` on success.

**Failure behavior**: On an unrecognized `_type`, respond `200` with
`{ "revalidated": false }` rather than an error — an unexpected document type should
never surface as a visible Studio/webhook failure to the non-technical owner.

**Non-goals**: This endpoint does not accept or process any other request; it is not a
general-purpose API. No other system calls it besides Sanity's webhook delivery.
