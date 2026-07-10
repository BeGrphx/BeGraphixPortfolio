import type { SanityProject } from "@/lib/sanity/queries";

export type ProjectLayoutBlockType =
  | "layoutVideoGallery"
  | "layoutText"
  | "layoutGallery"
  | "layoutPdf"
  | "layoutMedia";

export interface ProjectLayoutBlock {
  _key: string;
  _type: ProjectLayoutBlockType;
}

export const PROJECT_LAYOUT_BLOCK_LABELS: Record<ProjectLayoutBlockType, string> =
  {
    layoutVideoGallery: "Vidéo(s)",
    layoutText: "Texte & crédits",
    layoutGallery: "Galerie images",
    layoutPdf: "Fichier PDF",
    layoutMedia: "Vidéos & liens",
  };

export const DEFAULT_PROJECT_LAYOUT: ProjectLayoutBlockType[] = [
  "layoutVideoGallery",
  "layoutText",
  "layoutGallery",
  "layoutPdf",
  "layoutMedia",
];

export function resolveProjectLayout(
  blocks?: ProjectLayoutBlock[] | null,
): ProjectLayoutBlockType[] {
  if (blocks?.length) {
    return blocks.map((block) => block._type);
  }
  return [...DEFAULT_PROJECT_LAYOUT];
}

export function layoutBlockHasContent(
  type: ProjectLayoutBlockType,
  project: SanityProject,
): boolean {
  switch (type) {
    case "layoutVideoGallery":
      return Boolean(project.videoGallery?.some((v) => v.videoUrl));
    case "layoutText":
      return Boolean(project.description || project.credits);
    case "layoutGallery":
      return Boolean(project.gallery?.length);
    case "layoutPdf":
      return Boolean(project.pdfFile?.asset?.url);
    case "layoutMedia":
      return Boolean(project.media?.length);
    default:
      return false;
  }
}
