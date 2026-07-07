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
    defineField({
      name: "heroVideoBlur",
      title: "Intensité du flou vidéo",
      type: "number",
      description: "0 = net, 24 = très flou. Recommandé : 6–14.",
      validation: (Rule) => Rule.min(0).max(48),
      initialValue: 10,
      hidden: ({ parent }) => parent?.heroBackgroundType !== "video",
    }),
    defineField({
      name: "heroBottomFade",
      title: "Fondu bas du hero",
      type: "number",
      description: "Hauteur de la transition douce vers la grille (px). Recommandé : 120–240.",
      validation: (Rule) => Rule.min(40).max(400),
      initialValue: 280,
      hidden: ({ parent }) => parent?.heroBackgroundType === "none",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Paramètres du site" };
    },
  },
});
