import { defineField, defineType } from "sanity";

/**
 * Sanity doesn't extract width/height for generic `file` assets the way it
 * does for `image` assets — `orientation` is how the editor tells the
 * ClusteredStillsGrid layout engine which row this clip belongs in.
 */
export const btsVideoClip = defineType({
  name: "btsVideoClip",
  title: "BTS video clip",
  type: "object",
  fields: [
    defineField({
      name: "file",
      title: "Video file",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "orientation",
      title: "Orientation",
      type: "string",
      options: {
        list: [
          { title: "Landscape", value: "landscape" },
          { title: "Portrait", value: "portrait" },
        ],
        layout: "radio",
      },
      initialValue: "landscape",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { orientation: "orientation" },
    prepare({ orientation }: { orientation?: string }) {
      return { title: `BTS video clip (${orientation ?? "landscape"})` };
    },
  },
});
