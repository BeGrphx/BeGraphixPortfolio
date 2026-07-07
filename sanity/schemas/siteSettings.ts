import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Paramètres du site",
  type: "document",
  fields: [
    defineField({
      name: "logo",
      title: "Logo (écran de chargement)",
      type: "image",
      description: "Affiché au chargement avec animation zoom + fade",
      options: { hotspot: true },
    }),
    defineField({
      name: "heroBackgroundType",
      title: "Fond de la page d'accueil",
      type: "string",
      options: {
        list: [
          { title: "Showreel vidéo (recommandé)", value: "video" },
          { title: "WebGL (grille animée)", value: "webgl" },
          { title: "Aucun effet", value: "none" },
        ],
        layout: "radio",
      },
      initialValue: "video",
    }),
    defineField({
      name: "showreelVideoUrl",
      title: "URL vidéo showreel (MP4 direct)",
      type: "url",
      description:
        "Lien direct vers un fichier .mp4 (ex: hébergé sur Sanity ou CDN). YouTube/Vimeo ne fonctionne pas ici.",
      hidden: ({ parent }) => parent?.heroBackgroundType !== "video",
    }),
    defineField({
      name: "showreelVideoFile",
      title: "Ou uploader une vidéo MP4/WebM",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
      hidden: ({ parent }) => parent?.heroBackgroundType !== "video",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Paramètres du site" };
    },
  },
});
