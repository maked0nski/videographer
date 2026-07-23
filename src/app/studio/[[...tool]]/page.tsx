import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity/sanity.config";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

/** Mounts Sanity Studio at /studio inside the Next.js app (plan.md Structure Decision). */
export default function StudioPage() {
  return <NextStudio config={config} />;
}
