import type { Locale } from "@/i18n/routing";
import { getLocalizedAuto } from "@/lib/i18n";
import type { SanityProject } from "@/lib/sanity/queries";

export async function localizeTags(
  tags: string[] | undefined,
  locale: Locale,
): Promise<string[] | undefined> {
  if (!tags?.length) return tags;
  if (locale === "fr") return tags;
  return Promise.all(tags.map((tag) => getLocalizedAuto(tag, locale)));
}

export async function localizeProject(
  project: SanityProject,
  locale: Locale,
): Promise<SanityProject & { displayTitle: string }> {
  const [displayTitle, tags] = await Promise.all([
    getLocalizedAuto(project.title, locale),
    localizeTags(project.tags, locale),
  ]);

  return {
    ...project,
    displayTitle,
    tags,
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
  const [title, description, credits, tags] = await Promise.all([
    getLocalizedAuto(project.title, locale),
    getLocalizedAuto(project.description, locale),
    getLocalizedAuto(project.credits, locale),
    localizeTags(project.tags, locale),
  ]);
  return { ...project, title, description, credits, tags };
}
