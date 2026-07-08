import { defineField, defineType } from "sanity";
import { BulkImageArrayInput } from "../components/BulkImageArrayInput";

export const project = defineType({
  name: "project",
  title: "Projet",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Titre",
      type: "localizedString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "title.fr", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "projectType",
      title: "Type de projet",
      type: "string",
      options: {
        list: [
          { title: "Showreel", value: "showreel" },
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
      hidden: ({ parent }) => parent?.projectType === "showreel",
    }),
    defineField({
      name: "completedAt",
      title: "Date de réalisation",
      type: "date",
      description: "Tri chronologique (récent → ancien)",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "duration",
      title: "Durée du projet",
      type: "string",
      description: 'Ex: "2 semaines", "3 mois"',
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "localizedText",
    }),
    defineField({
      name: "credits",
      title: "Crédits / mentions légales",
      type: "localizedText",
      description: "Texte affiché en petit (ex: © TF1 / Endemol…)",
    }),
    defineField({
      name: "tags",
      title: "Tags / Thème",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "Pour les showreels : indiquez le thème ici (ex: Motion Design, Vidéo IA).",
    }),
    defineField({
      name: "showreelVideoUrl",
      title: "URL vidéo showreel (MP4)",
      type: "url",
      description: "Lien direct .mp4 — affiché en pleine largeur dans l'onglet Showreel.",
      hidden: ({ parent }) => parent?.projectType !== "showreel",
    }),
    defineField({
      name: "showreelVideoFile",
      title: "Ou uploader la vidéo showreel",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
      hidden: ({ parent }) => parent?.projectType !== "showreel",
    }),
    defineField({
      name: "dominantColor",
      title: "Couleur dominante",
      type: "string",
      description: "Hex (#1a2b3c) — teinte la page projet. Laisse vide pour auto.",
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true;
          return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value)
            ? true
            : "Format hex requis (#RRGGBB)";
        }),
    }),
    defineField({
      name: "thumbnail",
      title: "Vignette (grille d'accueil)",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", title: "Texte alternatif", type: "string" }),
      ],
      hidden: ({ parent }) => parent?.projectType === "showreel",
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { projectType?: string };
          if (parent?.projectType === "showreel") return true;
          return value ? true : "La vignette est requise.";
        }),
    }),
    defineField({
      name: "hoverPreviewUrl",
      title: "Vidéo preview au survol",
      type: "url",
      description: "URL MP4 ou Vimeo — jouée au survol sur la grille",
    }),
    defineField({
      name: "gallery",
      title: "Galerie photos",
      type: "array",
      description: "Glissez-déposez plusieurs images d'un coup.",
      components: { input: BulkImageArrayInput },
      options: { layout: "grid" },
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", title: "Alt", type: "string" }),
            defineField({ name: "caption", title: "Légende", type: "string" }),
          ],
        },
      ],
    }),
    defineField({
      name: "videoGallery",
      title: "Galerie vidéos",
      type: "array",
      description: "Uploadez vos fichiers sources MP4/WebM — lecteur custom sur la page projet.",
      of: [
        {
          type: "object",
          name: "videoItem",
          title: "Vidéo",
          fields: [
            defineField({
              name: "title",
              title: "Titre (optionnel)",
              type: "string",
            }),
            defineField({
              name: "videoFile",
              title: "Fichier vidéo",
              type: "file",
              options: { accept: "video/mp4,video/webm" },
            }),
            defineField({
              name: "videoUrl",
              title: "Ou URL MP4 directe",
              type: "url",
              description: "Alternative si la vidéo est hébergée ailleurs.",
            }),
            defineField({
              name: "poster",
              title: "Image de couverture",
              type: "image",
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { title: "title", videoUrl: "videoUrl" },
            prepare({ title, videoUrl }) {
              return {
                title: title || "Vidéo",
                subtitle: videoUrl ? "URL externe" : "Fichier uploadé",
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "pdfFile",
      title: "Fichier PDF",
      type: "file",
      options: { accept: "application/pdf" },
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
                  { title: "Fichier vidéo (upload)", value: "file" },
                  { title: "Mux (player custom)", value: "mux" },
                  { title: "YouTube", value: "youtube" },
                  { title: "Vimeo", value: "vimeo" },
                  { title: "Instagram", value: "instagram" },
                  { title: "LinkedIn", value: "linkedin" },
                  { title: "Lien externe", value: "link" },
                ],
                layout: "radio",
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "videoFile",
              title: "Fichier vidéo",
              type: "file",
              options: { accept: "video/mp4,video/webm" },
              hidden: ({ parent }) => parent?.mediaType !== "file",
            }),
            defineField({
              name: "poster",
              title: "Image de couverture",
              type: "image",
              options: { hotspot: true },
              hidden: ({ parent }) => parent?.mediaType !== "file",
            }),
            defineField({
              name: "muxPlaybackId",
              title: "Mux Playback ID",
              type: "string",
              hidden: ({ parent }) => parent?.mediaType !== "mux",
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              hidden: ({ parent }) =>
                parent?.mediaType === "mux" || parent?.mediaType === "file",
            }),
            defineField({
              name: "title",
              title: "Titre (optionnel)",
              type: "string",
            }),
            defineField({
              name: "label",
              title: "Texte du bouton",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "title", mediaType: "mediaType", url: "url" },
            prepare({ title, mediaType, url }) {
              return { title: title || url || mediaType, subtitle: mediaType };
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
  ],
  preview: {
    select: {
      title: "title.fr",
      subtitle: "client",
      media: "thumbnail",
    },
  },
});
