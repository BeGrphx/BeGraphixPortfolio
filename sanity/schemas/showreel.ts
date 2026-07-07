import { defineField, defineType } from "sanity";

export const showreel = defineType({
  name: "showreel",
  title: "Showreel",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Titre",
      type: "localizedString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "theme",
      title: "Thème",
      type: "string",
      description: "Ex: Motion Design, Vidéo IA, Brand Film…",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "completedAt",
      title: "Date",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "videoUrl",
      title: "URL vidéo MP4 directe",
      type: "url",
      description: "Lien direct .mp4 uniquement.",
    }),
    defineField({
      name: "videoFile",
      title: "Ou uploader un MP4 / WebM",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
      validation: (rule) =>
        rule.custom((_, context) => {
          const parent = context.parent as {
            videoUrl?: string;
            videoFile?: unknown;
          };
          if (!parent?.videoUrl && !parent?.videoFile) {
            return "Ajoutez une URL ou un fichier vidéo.";
          }
          return true;
        }),
    }),
  ],
  orderings: [
    {
      title: "Date (récent)",
      name: "completedAtDesc",
      by: [{ field: "completedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title.fr",
      theme: "theme",
      date: "completedAt",
    },
    prepare({ title, theme, date }) {
      return {
        title: title ?? "Showreel",
        subtitle: [theme, date].filter(Boolean).join(" · "),
      };
    },
  },
});
