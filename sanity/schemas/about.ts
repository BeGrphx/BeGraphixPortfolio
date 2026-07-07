import { defineField, defineType } from "sanity";

export const about = defineType({
  name: "about",
  title: "À propos",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Titre",
      type: "string",
      initialValue: "À propos",
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "text",
      rows: 8,
    }),
    defineField({
      name: "email",
      title: "Email de contact",
      type: "string",
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: "socialLinks",
      title: "Réseaux sociaux",
      type: "array",
      of: [
        {
          type: "object",
          name: "socialLink",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "url", title: "URL", type: "url" }),
          ],
          preview: {
            select: { title: "label", subtitle: "url" },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Page À propos" };
    },
  },
});
