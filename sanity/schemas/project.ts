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
      name: "projectType",
      title: "Type de projet",
      type: "string",
      options: {
        list: [
          { title: "Professionnel", value: "professional" },
          { title: "Personnel", value: "personal" },
        ],
        layout: "radio",
      },
      initialValue: "professional",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "client",
      title: "Client",
      type: "string",
    }),
    defineField({
      name: "completedAt",
      title: "Date de réalisation",
      type: "date",
      description: "Utilisée pour le tri chronologique (du plus récent au plus ancien)",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 6,
    }),
    defineField({
      name: "credits",
      title: "Crédits / mentions légales",
      type: "text",
      rows: 3,
      description:
        "Texte affiché en petit (ex: © TF1 / Endemol. All rights reserved…)",
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
      title: "Vignette (grille d'accueil)",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Texte alternatif",
          type: "string",
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "gallery",
      title: "Galerie photos",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Texte alternatif",
              type: "string",
            }),
            defineField({
              name: "caption",
              title: "Légende (optionnel)",
              type: "string",
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "media",
      title: "Vidéos & liens",
      type: "array",
      of: [
        {
          type: "object",
          name: "mediaItem",
          title: "Média",
          fields: [
            defineField({
              name: "mediaType",
              title: "Type",
              type: "string",
              options: {
                list: [
                  { title: "YouTube (embed)", value: "youtube" },
                  { title: "Vimeo (embed)", value: "vimeo" },
                  { title: "Instagram (embed ou lien)", value: "instagram" },
                  { title: "LinkedIn (lien)", value: "linkedin" },
                  { title: "Lien externe", value: "link" },
                ],
                layout: "radio",
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "title",
              title: "Titre (optionnel)",
              type: "string",
            }),
            defineField({
              name: "label",
              title: "Texte du bouton (liens)",
              type: "string",
              description: 'Ex: "Watch on Instagram", "Voir sur LinkedIn"',
            }),
          ],
          preview: {
            select: {
              title: "title",
              mediaType: "mediaType",
              url: "url",
            },
            prepare({ title, mediaType, url }) {
              return {
                title: title || url,
                subtitle: mediaType,
              };
            },
          },
        },
      ],
    }),
  ],
  orderings: [
    {
      title: "Date (récent → ancien)",
      name: "completedAtDesc",
      by: [{ field: "completedAt", direction: "desc" }],
    },
    {
      title: "Date (ancien → récent)",
      name: "completedAtAsc",
      by: [{ field: "completedAt", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "client",
      projectType: "projectType",
      media: "thumbnail",
      completedAt: "completedAt",
    },
    prepare({ title, subtitle, projectType, media, completedAt }) {
      const typeLabel =
        projectType === "personal" ? "Perso" : "Pro";
      return {
        title,
        subtitle: [subtitle, typeLabel, completedAt].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
