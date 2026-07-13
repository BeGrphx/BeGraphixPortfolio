import type { DocumentBadgeComponent } from "sanity";
import { getMediaOptimizationStatus } from "../../lib/media-optimization";

export const mediaOptimizationBadge: DocumentBadgeComponent = (props) => {
  const document = props.draft ?? props.published;
  if (!document) return null;

  const status = getMediaOptimizationStatus(document);
  if (status === "none") return null;

  if (status === "optimized") {
    return {
      label: "Médias OK",
      title: "Toutes les vidéos sont optimisées et servies depuis R2.",
      color: "success",
    };
  }

  return {
    label: "Optimisation…",
    title:
      "Après publication, les vidéos seront compressées et publiées automatiquement (1 à 5 min).",
    color: "warning",
  };
};
