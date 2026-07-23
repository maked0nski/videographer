import type { MetadataRoute } from "next";
import { LOCALES } from "@/types";
import { getAllProjects } from "@/lib/content/queries";

const STATIC_PATHS = ["", "/work", "/about"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const path of STATIC_PATHS) {
      entries.push({ url: `${siteUrl}/${locale}${path}`, lastModified: new Date() });
    }

    const projects = await getAllProjects(locale);
    for (const project of projects) {
      entries.push({
        url: `${siteUrl}/${locale}/work/${project.slug}`,
        lastModified: new Date(),
      });
    }
  }

  return entries;
}
