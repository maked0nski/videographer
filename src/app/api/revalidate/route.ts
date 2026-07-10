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

function pathsFor(payload: SanityWebhookPayload): string[] {
  switch (payload._type) {
    case "project": {
      const paths = LOCALES.flatMap((locale) => [`/${locale}`, `/${locale}/work`]);
      if (payload.slug?.current) {
        paths.push(...LOCALES.map((locale) => `/${locale}/work/${payload.slug!.current}`));
      }
      return paths;
    }
    case "profile":
      return LOCALES.flatMap((locale) => [`/${locale}/about`, `/${locale}`]);
    case "siteSettings":
      return LOCALES.map((locale) => `/${locale}`);
    default:
      return [];
  }
}

/**
 * Sanity webhook → on-demand ISR revalidation (contracts/revalidate-webhook.md,
 * FR-025). Sanity signs every request; a request that fails verification is
 * rejected with 401 and triggers no revalidation. An unrecognized `_type`
 * still responds 200 with `revalidated: false` — it must never surface as a
 * visible failure to the non-technical owner.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  const body = await request.text();

  if (!secret || !signature || !(await isValidSignature(body, signature, secret))) {
    return NextResponse.json({ revalidated: false, message: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body) as SanityWebhookPayload;
  const paths = pathsFor(payload);

  if (paths.length === 0) {
    return NextResponse.json({ revalidated: false });
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, paths });
}
