import { defineArrayMember } from "sanity";

const layoutBlockPreview = {
  prepare() {
    return { title: "" };
  },
};

export const projectLayoutBlockMembers = [
  defineArrayMember({
    type: "object",
    name: "layoutVideoGallery",
    title: "Vidéo(s)",
    icon: () => "▶",
    fields: [
      {
        name: "hint",
        type: "string",
        readOnly: true,
        initialValue: "Affiche la galerie vidéos (lecteur complet) du projet.",
      },
    ],
    preview: {
      prepare: () => ({
        title: "Vidéo(s)",
        subtitle: "Galerie vidéos — lecteur complet",
      }),
    },
  }),
  defineArrayMember({
    type: "object",
    name: "layoutText",
    title: "Texte & crédits",
    icon: () => "¶",
    fields: [
      {
        name: "hint",
        type: "string",
        readOnly: true,
        initialValue: "Affiche la description et les crédits / mentions légales.",
      },
    ],
    preview: {
      prepare: () => ({
        title: "Texte & crédits",
        subtitle: "Description + mentions légales",
      }),
    },
  }),
  defineArrayMember({
    type: "object",
    name: "layoutGallery",
    title: "Galerie images",
    icon: () => "▦",
    fields: [
      {
        name: "hint",
        type: "string",
        readOnly: true,
        initialValue: "Affiche la galerie images & loops du projet.",
      },
    ],
    preview: {
      prepare: () => ({
        title: "Galerie images",
        subtitle: "Images et vidéos en boucle",
      }),
    },
  }),
  defineArrayMember({
    type: "object",
    name: "layoutPdf",
    title: "Fichier PDF",
    icon: () => "↓",
    fields: [
      {
        name: "hint",
        type: "string",
        readOnly: true,
        initialValue: "Affiche le bouton de téléchargement PDF.",
      },
    ],
    preview: {
      prepare: () => ({
        title: "Fichier PDF",
        subtitle: "Bouton téléchargement",
      }),
    },
  }),
  defineArrayMember({
    type: "object",
    name: "layoutMedia",
    title: "Vidéos & liens",
    icon: () => "🔗",
    fields: [
      {
        name: "hint",
        type: "string",
        readOnly: true,
        initialValue: "Affiche les blocs médias (Instagram, YouTube, etc.).",
      },
    ],
    preview: {
      prepare: () => ({
        title: "Vidéos & liens",
        subtitle: "Médias embarqués et liens externes",
      }),
    },
  }),
];

export { layoutBlockPreview };
