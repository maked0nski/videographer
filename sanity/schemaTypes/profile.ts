import { defineField, defineType } from "sanity";

/** Singleton — the site owner's public identity and contact details. */
export default defineType({
  name: "profile",
  title: "Profile",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Brand name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "fullName",
      title: "Full name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "tagline", title: "Tagline", type: "localeString" }),
    defineField({ name: "biography", title: "Biography", type: "localeText" }),
    defineField({
      name: "portrait",
      title: "Portrait",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (r) => r.required().email(),
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram URL",
      type: "url",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "youtubeUrl",
      title: "YouTube URL",
      type: "url",
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "name" },
  },
});
