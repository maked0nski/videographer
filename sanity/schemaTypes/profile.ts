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
      description: "Short brand name shown in the site header and footer (e.g. \"YERRMAK\").",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "fullName",
      title: "Full name",
      type: "string",
      description: "Full name, shown on the About page and used as the portrait's alt text.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "localeString",
      description: "One-line description shown under the name on the homepage/About page.",
    }),
    defineField({
      name: "biography",
      title: "Biography",
      type: "localeText",
      description: "The paragraph shown on the About page, next to the portrait.",
    }),
    defineField({
      name: "portrait",
      title: "Portrait",
      type: "image",
      description: "Photo shown on the About page next to the biography.",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      description: "Shown as a clickable mail icon in the \"Get in touch\" section — this site has no contact form.",
      validation: (r) => r.required().email(),
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram URL",
      type: "url",
      description: "Full profile URL (e.g. https://www.instagram.com/yerrmak/) — shown as an icon in \"Get in touch\".",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "youtubeUrl",
      title: "YouTube URL",
      type: "url",
      description: "Full channel URL — shown as an icon in \"Get in touch\". This is your channel, not a specific project's video link.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "linkedinUrl",
      title: "LinkedIn URL",
      type: "url",
      description: "Optional — the LinkedIn icon only appears on the site once this is filled in.",
    }),
    defineField({
      name: "facebookUrl",
      title: "Facebook URL",
      type: "url",
      description: "Optional — the Facebook icon only appears on the site once this is filled in.",
    }),
  ],
  preview: {
    select: { title: "name" },
  },
});
