import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Paramètres du site",
  type: "document",
  fields: [
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
      title: "URL vidéo showreel (MP4)",
      type: "url",
      description: "Vidéo en boucle, muette, floutée en fond. Ex: lien direct .mp4",
      hidden: ({ parent }) => parent?.heroBackgroundType !== "video",
    }),
    defineField({
      name: "showreelVideoFile",
      title: "Ou uploader une vidéo",
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
