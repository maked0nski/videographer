import { defineField, defineType } from "sanity";

/**
 * Shared uk/en pair used by every translatable single-line field — neither
 * language is required at the schema level, matching the graceful-fallback
 * behavior of `resolveLocalized`.
 */
export const localeString = defineType({
  name: "localeString",
  title: "Localized string",
  type: "object",
  fields: [
    defineField({ name: "uk", title: "Ukrainian", type: "string" }),
    defineField({ name: "en", title: "English", type: "string" }),
  ],
});
