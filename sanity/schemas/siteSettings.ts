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
      description: "Animation zoom + fade au chargement",
      options: { hotspot: true },
    }),
    defineField({
      name: "heroBackgroundType",
      title: "Fond de la page d'accueil",
      type: "string",
      options: {
        list: [
          { title: "Showreel vidéo (MP4)", value: "video" },
          { title: "Fond organique (CSS)", value: "organic" },
          { title: "Aucun (noir/blanc)", value: "none" },
        ],
        layout: "radio",
      },
      initialValue: "video",
    }),
    defineField({
      name: "showreelVideoUrl",
      title: "URL vidéo MP4 directe",
      type: "url",
      description:
        "Lien direct .mp4 uniquement. YouTube/Vimeo ne fonctionnent pas. Ex: https://cdn.sanity.io/files/.../video.mp4",
      hidden: ({ parent }) => parent?.heroBackgroundType !== "video",
    }),
    defineField({
      name: "showreelVideoFile",
      title: "Ou uploader un MP4 / WebM",
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
