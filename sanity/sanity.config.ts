"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { schemaTypes } from "./schemaTypes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

/**
 * Embedded Studio, mounted at `/studio` inside the Next.js app (plan.md
 * Structure Decision) — one deployable unit for the non-technical owner.
 * The Projects list is a drag-and-drop orderable list
 * (@sanity/orderable-document-list) backed by the hidden `orderRank` string
 * field — reordering happens by dragging, never by typing a number, which is
 * what makes duplicate order values structurally impossible. `orderRank` is
 * the same field `getAllProjects`/`getAdjacentProjects` sort by
 * (data-model.md), so Studio and the live site are never out of sync with
 * two different ordering mechanisms.
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
      structure: (S, context) =>
        S.list()
          .title("Content")
          .items([
            orderableDocumentListDeskItem({ type: "project", title: "Projects", S, context }),
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
