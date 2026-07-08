import type { ProjectType } from "@/lib/sanity/queries";
import type { FilterValue } from "@/components/ProjectFilter";

export function projectTypeToHomeFilter(
  projectType?: ProjectType,
): Exclude<FilterValue, "showreel"> | "showreel" {
  if (projectType === "personal") return "personal";
  if (projectType === "showreel") return "showreel";
  return "professional";
}

export function getHomeProjectsHref(filter: FilterValue): string {
  return `/?filter=${filter}#projects`;
}
