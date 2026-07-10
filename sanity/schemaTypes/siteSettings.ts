import { defineField, defineType } from "sanity";

/** Singleton — site-wide settings not tied to a Project or the Profile. */
export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "showreelUrl",
      title: "Showreel URL",
      type: "url",
      description: "Opened by the homepage hero's showreel button.",
      validation: (r) => r.required(),
    }),
    defineField({ name: "contactCtaText", title: "Contact CTA text", type: "localeString" }),
    defineField({
      name: "seoTitle",
      title: "SEO title",
      type: "localeString",
      description: "Falls back to Profile name + tagline when empty.",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "localeString",
      description: "Falls back to Profile tagline when empty.",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site Settings" };
    },
  },
});
