import type { Locale } from "@/i18n/routing";
import { getLocalizedAuto } from "@/lib/i18n";
import type { SanityProject } from "@/lib/sanity/queries";

export async function localizeProject(
  project: SanityProject,
  locale: Locale,
): Promise<SanityProject & { displayTitle: string }> {
  return {
    ...project,
    displayTitle: await getLocalizedAuto(project.title, locale),
  };
}

export async function localizeProjects(
  projects: SanityProject[],
  locale: Locale,
) {
  return Promise.all(projects.map((p) => localizeProject(p, locale)));
}

export async function localizeProjectDetail(
  project: SanityProject,
  locale: Locale,
) {
  const [title, description, credits] = await Promise.all([
    getLocalizedAuto(project.title, locale),
    getLocalizedAuto(project.description, locale),
    getLocalizedAuto(project.credits, locale),
  ]);
  return { ...project, title, description, credits };
}
