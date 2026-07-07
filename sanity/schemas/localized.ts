import { defineField, defineType } from "sanity";

export const localizedString = defineType({
  name: "localizedString",
  title: "Texte multilingue",
  type: "object",
  fields: [
    defineField({
      name: "fr",
      title: "Français",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "en",
      title: "English",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "es",
      title: "Español",
      type: "text",
      rows: 2,
    }),
  ],
});

export const localizedText = defineType({
  name: "localizedText",
  title: "Texte long multilingue",
  type: "object",
  fields: [
    defineField({
      name: "fr",
      title: "Français",
      type: "text",
      rows: 6,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "en",
      title: "English",
      type: "text",
      rows: 6,
    }),
    defineField({
      name: "es",
      title: "Español",
      type: "text",
      rows: 6,
    }),
  ],
});
