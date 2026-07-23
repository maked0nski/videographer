import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { LOCALES } from "@/types";

interface SanityWebhookPayload {
  _type: string;
  _id: string;
  slug?: { current: string };
}

interface RevalidationEntry {
  path: string;
  type?: "layout" | "page";
}

/**
 * `siteSettings` drives nav/footer labels in the shared `[locale]` layout
 * plus headings on the work/about/project pages — not just the homepage —
 * so it revalidates the whole locale subtree via the `"layout"` type rather
 * than a fixed list of literal paths (next/cache revalidatePath docs:
 * layout-type revalidation cascades to every nested page).
 */
function entriesFor(payload: SanityWebhookPayload): RevalidationEntry[] {
  switch (payload._type) {
    case "project": {
      const entries = LOCALES.flatMap((locale) => [
        { path: `/${locale}` },
        { path: `/${locale}/work` },
      ]);
      if (payload.slug?.current) {
        entries.push(
          ...LOCALES.map((locale) => ({ path: `/${locale}/work/${payload.slug!.current}` })),
        );
      }
      return entries;
    }
    case "profile":
      return LOCALES.flatMap((locale) => [{ path: `/${locale}/about` }, { path: `/${locale}` }]);
    case "siteSettings":
      return LOCALES.map((locale) => ({ path: `/${locale}`, type: "layout" as const }));
    default:
      return [];
  }
}

/**
 * Sanity webhook → on-demand ISR revalidation. Sanity signs every request; a
 * request that fails verification is rejected with 401 and triggers no
 * revalidation. An unrecognized `_type` still responds 200 with
 * `revalidated: false` — it must never surface as a visible failure to the
 * non-technical owner.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  const body = await request.text();

  if (!secret || !signature || !(await isValidSignature(body, signature, secret))) {
    return NextResponse.json({ revalidated: false, message: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body) as SanityWebhookPayload;
  const entries = entriesFor(payload);

  if (entries.length === 0) {
    return NextResponse.json({ revalidated: false });
  }

  for (const entry of entries) {
    revalidatePath(entry.path, entry.type);
  }

  return NextResponse.json({ revalidated: true, paths: entries.map((entry) => entry.path) });
}
