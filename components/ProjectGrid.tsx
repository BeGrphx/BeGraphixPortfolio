"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type {
  ProjectWithDisplay,
  ShowreelWithDisplay,
} from "@/lib/sanity/queries";
import { FilteredProjectGrid } from "./FilteredProjectGrid";
import { ProjectFilter, type FilterValue } from "./ProjectFilter";
import { ShowreelList } from "./ShowreelList";

interface ProjectGridProps {
  projects: ProjectWithDisplay[];
  showreels: ShowreelWithDisplay[];
  locale: Locale;
}

export function ProjectGrid({
  projects,
  showreels,
  locale,
}: ProjectGridProps) {
  const t = useTranslations("home");
  const hasShowreels = showreels.length > 0;
  const [filter, setFilter] = useState<FilterValue>(
    hasShowreels ? "showreel" : "professional",
  );

  const counts = {
    showreel: showreels.length,
    professional: projects.filter(
      (p) => (p.projectType ?? "professional") === "professional",
    ).length,
    personal: projects.filter((p) => p.projectType === "personal").length,
  };

  if (projects.length === 0 && !hasShowreels) {
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
        <ProjectFilter
          value={filter}
          onChange={setFilter}
          counts={counts}
          hasShowreel={hasShowreels}
        />
      </div>
      {filter === "showreel" ? (
        <ShowreelList showreels={showreels} />
      ) : (
        <FilteredProjectGrid
          projects={projects}
          filter={filter}
          locale={locale}
        />
      )}
    </>
  );
}
