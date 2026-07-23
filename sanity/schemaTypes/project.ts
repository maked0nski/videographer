import { defineField, defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

/**
 * A single `type` field (Video/Photo) drives which of the fields below are
 * shown in Studio, the Work page filter, and page rendering — never a
 * separate category field.
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
      description: "Drives which fields below apply and how this project displays across the site (Video vs Photo) — pick this first.",
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
      description: "Shown as the page heading and in Work list cards. Fill in at least one language; the other language falls back to whichever one is filled.",
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
      description: "The main thumbnail — used on Work list cards, homepage previews, and as the poster before a video is played.",
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
      name: "camera",
      title: "Camera",
      type: "string",
      description: 'e.g. "ARRI Alexa Mini" or "RED V-Raptor". Optional.',
    }),
    defineField({
      name: "lenses",
      title: "Lenses",
      type: "string",
      description: 'e.g. "Cooke Anamorphic/i SF". Optional.',
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
      description: "A short paragraph shown under the title on the project's own page. Keep it to 1–3 sentences.",
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
      name: "previewClip",
      title: "Preview clip (muted loop)",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
      description:
        "Optional — a short (3–5s), heavily compressed, silent loop shown before the visitor clicks Play. Falls back to the cover image when not set. Video projects only.",
      hidden: ({ document }) => document?.type !== "video",
    }),
    defineField({
      name: "filmStills",
      title: "Film Stills Gallery",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", title: "Alt text", type: "string" }],
        },
      ],
      description:
        "Color-graded highlight stills from the finished film. No hard limit, but 4–6 is the recommended range. Video projects only.",
      hidden: ({ document }) => document?.type !== "video",
    }),
    defineField({
      name: "behindTheScenes",
      title: "Behind the Scenes",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", title: "Alt text", type: "string" }],
        },
        { type: "btsVideoClip" },
      ],
      description:
        "Production stills and/or short looping video clips documenting the process on set — mix them in any order. Video projects only.",
      hidden: ({ document }) => document?.type !== "video",
    }),
    defineField({
      name: "photoGallery",
      title: "Photo Gallery",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", title: "Alt text", type: "string" }],
        },
      ],
      description: "Full-resolution photos for this photography project.",
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as { type?: string } | undefined;
          if (doc?.type === "photo" && (!value || value.length === 0)) {
            return "Photo projects need at least one gallery image";
          }
          return true;
        }),
      hidden: ({ document }) => document?.type !== "photo",
    }),
    orderRankField({ type: "project" }),
    defineField({
      name: "featured",
      title: "Featured on homepage",
      type: "boolean",
      description: "Shows this project in the homepage's Selected Work section. Turn off for projects you only want listed on the Work page.",
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
  orderings: [orderRankOrdering],
  preview: {
    select: { title: "title.en", titleUk: "title.uk", type: "type", media: "coverImage" },
    prepare({ title, titleUk, type, media }) {
      return { title: title || titleUk || "Untitled", subtitle: type, media };
    },
  },
});
