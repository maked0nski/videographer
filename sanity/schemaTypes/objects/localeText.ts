import { defineField, defineType } from "sanity";

/** Shared uk/en pair for longer free-text fields (description, biography). */
export const localeText = defineType({
  name: "localeText",
  title: "Localized text",
  type: "object",
  fields: [
    defineField({ name: "uk", title: "Ukrainian", type: "text", rows: 4 }),
    defineField({ name: "en", title: "English", type: "text", rows: 4 }),
  ],
});
