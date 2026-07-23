import { defineField, defineType } from "sanity";

/** Singleton — site-wide settings not tied to a Project or the Profile. */
export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "general", title: "General", default: true },
    { name: "navigation", title: "Navigation & footer" },
    { name: "homepage", title: "Homepage" },
    { name: "work", title: "Work page" },
    { name: "project", title: "Project page" },
    { name: "about", title: "About page" },
    { name: "gallery", title: "Galleries" },
  ],
  fields: [
    defineField({
      name: "showreelUrl",
      title: "Showreel URL",
      type: "url",
      description: "Opened by the homepage hero's showreel button.",
      validation: (r) => r.required(),
      group: "general",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO title",
      type: "localeString",
      description: "Falls back to Profile name + tagline when empty.",
      group: "general",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "localeString",
      description: "Falls back to Profile tagline when empty.",
      group: "general",
    }),

    defineField({
      name: "navHomeLabel",
      title: "\"Home\" nav label",
      type: "localeString",
      group: "navigation",
    }),
    defineField({
      name: "navWorkLabel",
      title: "\"Work\" nav label",
      type: "localeString",
      group: "navigation",
    }),
    defineField({
      name: "navAboutLabel",
      title: "\"About & Contact\" nav label",
      type: "localeString",
      group: "navigation",
    }),
    defineField({
      name: "footerRightsText",
      title: "Footer copyright text",
      type: "localeString",
      description: "Shown after the brand name and year, e.g. \"All rights reserved.\"",
      group: "navigation",
    }),

    defineField({
      name: "watchShowreelLabel",
      title: "\"Watch Showreel\" button label",
      type: "localeString",
      group: "homepage",
    }),
    defineField({
      name: "selectedWorkHeading",
      title: "\"Selected Work\" section heading",
      type: "localeString",
      group: "homepage",
    }),
    defineField({
      name: "viewAllWorkLabel",
      title: "\"View all work\" link label",
      type: "localeString",
      group: "homepage",
    }),
    defineField({
      name: "photographyHeading",
      title: "\"Photography\" section heading",
      type: "localeString",
      group: "homepage",
    }),
    defineField({
      name: "viewPhotographyLabel",
      title: "\"View photography\" link label",
      type: "localeString",
      group: "homepage",
    }),
    defineField({
      name: "contactCtaText",
      title: "Contact CTA heading",
      type: "localeString",
      description: "Heading shown above the \"Get in touch\" button on the homepage (e.g. \"Let's create something\").",
      group: "homepage",
    }),
    defineField({
      name: "contactCtaButtonLabel",
      title: "\"Get in touch\" button label (homepage)",
      type: "localeString",
      group: "homepage",
    }),

    defineField({
      name: "workPageHeading",
      title: "Work page heading",
      type: "localeString",
      group: "work",
    }),
    defineField({
      name: "filterAllLabel",
      title: "\"All\" filter label",
      type: "localeString",
      group: "work",
    }),
    defineField({
      name: "filterFilmsLabel",
      title: "\"Films\" filter label",
      type: "localeString",
      group: "work",
    }),
    defineField({
      name: "filterPhotographyLabel",
      title: "\"Photography\" filter label",
      type: "localeString",
      group: "work",
    }),

    defineField({
      name: "behindTheScenesHeading",
      title: "\"Behind the Scenes\" section heading",
      type: "localeString",
      group: "project",
    }),
    defineField({
      name: "previousProjectLabel",
      title: "\"Previous project\" label",
      type: "localeString",
      group: "project",
    }),
    defineField({
      name: "nextProjectLabel",
      title: "\"Next project\" label",
      type: "localeString",
      group: "project",
    }),
    defineField({
      name: "yearFieldLabel",
      title: "\"Year\" field label",
      type: "localeString",
      group: "project",
    }),
    defineField({
      name: "locationFieldLabel",
      title: "\"Location\" field label",
      type: "localeString",
      group: "project",
    }),
    defineField({
      name: "roleFieldLabel",
      title: "\"Role\" field label",
      type: "localeString",
      group: "project",
    }),
    defineField({
      name: "producerDirectorFieldLabel",
      title: "\"Producer / Director\" field label",
      type: "localeString",
      group: "project",
    }),
    defineField({
      name: "recognitionFieldLabel",
      title: "\"Recognition\" field label",
      type: "localeString",
      group: "project",
    }),
    defineField({
      name: "filmStillsHeading",
      title: "\"Film Stills\" section heading",
      type: "localeString",
      group: "project",
    }),
    defineField({
      name: "cameraFieldLabel",
      title: "\"Camera\" field label",
      type: "localeString",
      group: "project",
    }),
    defineField({
      name: "lensesFieldLabel",
      title: "\"Lenses\" field label",
      type: "localeString",
      group: "project",
    }),
    defineField({
      name: "galleryDefaultDisplayCount",
      title: "Default gallery display count",
      type: "number",
      description:
        "How many items the Film Stills / Photo Gallery / Behind the Scenes grid shows before the rest move into the scrollable filmstrip below it.",
      initialValue: 8,
      validation: (rule) => rule.required().integer().min(1),
      group: "gallery",
    }),

    defineField({
      name: "aboutPageHeading",
      title: "About page heading",
      type: "localeString",
      group: "about",
    }),
    defineField({
      name: "aboutContactHeading",
      title: "\"Get in touch\" section heading (About page)",
      type: "localeString",
      group: "about",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site Settings" };
    },
  },
});
