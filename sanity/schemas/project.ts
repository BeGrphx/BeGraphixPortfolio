import { defineField, defineType } from "sanity";
import { BulkGalleryArrayInput } from "../components/BulkGalleryArrayInput";
import { BulkVideoArrayInput } from "../components/BulkVideoArrayInput";
import { ProjectLayoutInput } from "../components/ProjectLayoutInput";
import { projectLayoutBlockMembers } from "./projectLayoutBlocks";

const defaultPageBlocks = [
  { _type: "layoutVideoGallery" as const, _key: "block-video" },
  { _type: "layoutText" as const, _key: "block-text" },
  { _type: "layoutGallery" as const, _key: "block-gallery" },
  { _type: "layoutPdf" as const, _key: "block-pdf" },
  { _type: "layoutMedia" as const, _key: "block-media" },
];

export const project = defineType({
  name: "project",
  title: "Projet",
  type: "document",
  groups: [
    { name: "layout", title: "Mise en page", default: true },
    { name: "info", title: "Informations" },
    { name: "content", title: "Contenu" },
  ],
  fields: [
    defineField({
      name: "pageBlocks",
      title: "Ordre des blocs sur la page",
      type: "array",
      group: "layout",
      description:
        "Définissez l'ordre d'affichage (vidéo, texte, images…). Utilisez l'onglet Aperçu pour visualiser le résultat.",
      components: { input: ProjectLayoutInput },
      of: projectLayoutBlockMembers,
      initialValue: defaultPageBlocks,
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "title",
      title: "Titre",
      type: "localizedString",
      group: "info",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      group: "info",
      options: { source: "title.fr", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "projectType",
      title: "Type de projet",
      type: "string",
      group: "info",
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
      group: "info",
      hidden: ({ parent }) => parent?.projectType === "showreel",
    }),
    defineField({
      name: "completedAt",
      title: "Date de réalisation",
      type: "date",
      group: "info",
      description: "Tri chronologique (récent → ancien)",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "duration",
      title: "Durée du projet",
      type: "string",
      group: "info",
      description: 'Ex: "2 semaines", "3 mois"',
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "localizedText",
      group: "content",
    }),
    defineField({
      name: "credits",
      title: "Crédits / mentions légales",
      type: "localizedText",
      group: "content",
      description: "Texte affiché en petit (ex: © TF1 / Endemol…)",
    }),
    defineField({
      name: "tags",
      title: "Tags / Thème",
      type: "array",
      group: "info",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "Pour les showreels : indiquez le thème ici (ex: Motion Design, Vidéo IA).",
    }),
    defineField({
      name: "showreelVideoUrl",
      title: "URL vidéo showreel (MP4)",
      type: "url",
      group: "info",
      description: "Lien direct .mp4 — affiché en pleine largeur dans l'onglet Showreel.",
      hidden: ({ parent }) => parent?.projectType !== "showreel",
    }),
    defineField({
      name: "showreelVideoFile",
      title: "Ou uploader la vidéo showreel",
      type: "file",
      group: "info",
      options: { accept: "video/mp4,video/webm" },
      hidden: ({ parent }) => parent?.projectType !== "showreel",
    }),
    defineField({
      name: "dominantColor",
      title: "Couleur dominante",
      type: "string",
      group: "info",
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
      group: "info",
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
      group: "info",
      description: "URL MP4 ou Vimeo — jouée au survol sur la grille",
    }),
    defineField({
      name: "gallery",
      title: "Galerie (images & loops)",
      type: "array",
      group: "content",
      description:
        "Images et vidéos en boucle — glissez-déposez, puis réordonnez la grille pour choisir l'ordre.",
      components: { input: BulkGalleryArrayInput },
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
        {
          type: "object",
          name: "galleryLoopItem",
          title: "Loop vidéo",
          fields: [
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
            }),
            defineField({
              name: "poster",
              title: "Image de couverture (optionnel)",
              type: "image",
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: {
              poster: "poster",
              fileName: "videoFile.asset.originalFilename",
            },
            prepare({ poster, fileName }) {
              return {
                title: fileName || "Loop vidéo",
                subtitle: "Vidéo en boucle",
                media: poster,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "videoGallery",
      title: "Galerie vidéos (lecteur complet)",
      type: "array",
      group: "content",
      description:
        "Vidéos avec lecteur custom en bas de page — son, plein écran, etc.",
      components: { input: BulkVideoArrayInput },
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
      group: "content",
      options: { accept: "application/pdf" },
    }),
    defineField({
      name: "media",
      title: "Vidéos & liens",
      type: "array",
      group: "content",
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
