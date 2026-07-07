import { defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Projet",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Titre",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "client",
      title: "Client",
      type: "string",
    }),
    defineField({
      name: "year",
      title: "Année",
      type: "number",
      validation: (rule) => rule.min(2000).max(2100),
    }),
    defineField({
      name: "description",
      title: "Description courte",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "thumbnail",
      title: "Vignette",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "videos",
      title: "Vidéos Vimeo",
      type: "array",
      of: [
        {
          type: "object",
          name: "video",
          title: "Vidéo",
          fields: [
            defineField({
              name: "title",
              title: "Titre (optionnel)",
              type: "string",
            }),
            defineField({
              name: "vimeoUrl",
              title: "URL Vimeo",
              type: "url",
              description:
                "Collez l'URL Vimeo (ex: https://vimeo.com/123456789)",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "vimeoUrl" },
          },
        },
      ],
    }),
    defineField({
      name: "order",
      title: "Ordre d'affichage",
      type: "number",
      description: "Plus petit = affiché en premier",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Ordre d'affichage",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "client",
      media: "thumbnail",
    },
  },
});
