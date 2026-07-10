"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

/**
 * Embedded Studio, mounted at `/studio` inside the Next.js app (plan.md
 * Structure Decision) — one deployable unit for the non-technical owner.
 * The Projects list defaults to sorting by the `order` field (FR-022) —
 * reordering is done by editing that number, the same field
 * `getAllProjects`/`getAdjacentProjects` sort by (data-model.md), so Studio
 * and the live site are never out of sync with two different ordering
 * mechanisms.
 */
export default defineConfig({
  name: "yerrmak-studio",
  title: "YERRMAK Studio",
  projectId,
  dataset,
  basePath: "/studio",
  schema: { types: schemaTypes },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Projects")
              .child(
                S.documentTypeList("project")
                  .title("Projects")
                  .defaultOrdering([{ field: "order", direction: "asc" }]),
              ),
            S.listItem()
              .title("Profile")
              .child(S.document().schemaType("profile").documentId("profile")),
            S.listItem()
              .title("Site Settings")
              .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
          ]),
    }),
  ],
});
