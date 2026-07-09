"use client";

import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { ProjectWithDisplay } from "@/lib/sanity/queries";
import { ProjectCard } from "./ProjectCard";
import type { FilterValue } from "./ProjectFilter";

interface FilteredProjectGridProps {
  projects: ProjectWithDisplay[];
  filter: Exclude<FilterValue, "showreel">;
  locale: Locale;
}

export function FilteredProjectGrid({
  projects,
  filter,
  locale,
}: FilteredProjectGridProps) {
  const t = useTranslations("home");

  const filtered = projects.filter(
    (p) => (p.projectType ?? "professional") === filter,
  );

  if (filtered.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/20 px-8 py-16 text-center">
        <p className="text-white/70">{t("noCategory")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2">
      {filtered.map((project) => (
        <ProjectCard
          key={project._id}
          project={project}
          locale={locale}
        />
      ))}
    </div>
  );
}
