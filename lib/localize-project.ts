import type { Locale } from "@/i18n/routing";
import { getLocalizedAuto } from "@/lib/i18n";
import { getKnownTagLabel, shouldKeepTagAsIs } from "@/lib/tag-labels";
import type { SanityProject } from "@/lib/sanity/queries";

async function localizeTag(tag: string, locale: Locale): Promise<string> {
  const knownLabel = getKnownTagLabel(tag, locale);
  if (knownLabel) return knownLabel;
  if (shouldKeepTagAsIs(tag)) return tag.trim();
  return getLocalizedAuto(tag, locale);
}

export async function localizeTags(
  tags: string[] | undefined,
  locale: Locale,
): Promise<string[] | undefined> {
  if (!tags?.length) return tags;
  if (locale === "fr") return tags;
  return Promise.all(tags.map((tag) => localizeTag(tag, locale)));
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
