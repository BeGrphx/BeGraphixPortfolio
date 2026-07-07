"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { ProjectWithDisplay } from "@/lib/sanity/queries";
import { FilteredProjectGrid } from "./FilteredProjectGrid";
import { ProjectFilter, type FilterValue } from "./ProjectFilter";

interface ProjectGridProps {
  projects: ProjectWithDisplay[];
  locale: Locale;
}

export function ProjectGrid({ projects, locale }: ProjectGridProps) {
  const t = useTranslations("home");
  const [filter, setFilter] = useState<FilterValue>("professional");

  const counts = {
    professional: projects.filter(
      (p) => (p.projectType ?? "professional") === "professional",
    ).length,
    personal: projects.filter((p) => p.projectType === "personal").length,
  };

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/20 px-8 py-16 text-center">
        <p className="text-white/70">{t("noProjects")}</p>
        <p className="mt-2 text-sm text-white/50">
          {t("addViaStudio")}{" "}
          <a href="/studio" className="underline hover:text-white/80">
            Sanity Studio
          </a>
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-14 flex w-full justify-center md:mb-20">
        <ProjectFilter value={filter} onChange={setFilter} counts={counts} />
      </div>
      <FilteredProjectGrid
        projects={projects}
        filter={filter}
        locale={locale}
      />
    </>
  );
}
