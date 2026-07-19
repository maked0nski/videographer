import { defineField, defineType } from "sanity";

/**
 * A single `type` field (Video/Photo) drives which of the fields below are
 * shown in Studio, the Work page filter, and page rendering — never a
 * separate category field (constitution Technology Constraints, FR-009,
 * FR-023, data-model.md).
 */
export default defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Video", value: "video" },
          { title: "Photo", value: "photo" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "localeString",
      validation: (rule) =>
        rule.custom((value: { uk?: string; en?: string } | undefined) =>
          value?.uk || value?.en ? true : "Provide at least one language",
        ),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "Shared across both locales — this is what makes language switching land on the same project.",
      options: { source: "title.en" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "string",
      description: 'Free text, e.g. "2023" or "2023–2024".',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({
      name: "role",
      title: "Role",
      type: "localeString",
      description: 'e.g. "Director of Photography".',
    }),
    defineField({
      name: "producerDirector",
      title: "Producer / Director",
      type: "localeString",
      description: "Optional credit line.",
    }),
    defineField({
      name: "recognition",
      title: "Recognition / stats",
      type: "localeString",
      description: "Optional free-text note — festival selection, view count, etc.",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "localeText",
    }),
    defineField({
      name: "youtubeUrl",
      title: "YouTube URL",
      type: "url",
      description: "e.g. https://youtube.com/watch?v=... — required for Video projects.",
      hidden: ({ document }) => document?.type !== "video",
      validation: (rule) =>
        rule
          .custom((value, context) => {
            const doc = context.document as { type?: string } | undefined;
            if (doc?.type === "video" && !value) {
              return "No YouTube link yet — fine to publish, but the video player won't show on the live page until this is filled in.";
            }
            return true;
          })
          .warning(),
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      description:
        "Primary gallery for Photo projects (required); optional behind-the-scenes set for Video projects.",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", title: "Alt text", type: "string" }],
        },
      ],
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as { type?: string } | undefined;
          if (doc?.type === "photo" && (!value || value.length === 0)) {
            return "Photo projects need at least one gallery image";
          }
          return true;
        }),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Drives Work list order, homepage Selected Work order, and prev/next sequence.",
      validation: (rule) => rule.required().integer(),
    }),
    defineField({
      name: "featured",
      title: "Featured on homepage",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "published",
      title: "Published",
      type: "boolean",
      description: "Gates visibility on the live site independent of Studio drafts.",
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title.en", titleUk: "title.uk", type: "type", media: "coverImage" },
    prepare({ title, titleUk, type, media }) {
      return { title: title || titleUk || "Untitled", subtitle: type, media };
    },
  },
});
