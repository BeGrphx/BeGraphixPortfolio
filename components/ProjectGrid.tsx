"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { ProjectWithDisplay } from "@/lib/sanity/queries";
import { FilteredProjectGrid } from "./FilteredProjectGrid";
import { ProjectFilter, type FilterValue } from "./ProjectFilter";
import { ShowreelList } from "./ShowreelList";

interface ProjectGridProps {
  projects: ProjectWithDisplay[];
  locale: Locale;
}

export function ProjectGrid({ projects, locale }: ProjectGridProps) {
  const t = useTranslations("home");
  const searchParams = useSearchParams();

  const showreelProjects = projects.filter((p) => p.projectType === "showreel");
  const gridProjects = projects.filter((p) => p.projectType !== "showreel");
  const hasShowreels = showreelProjects.length > 0;

  const paramFilter = useMemo((): FilterValue | null => {
    const value = searchParams.get("filter");
    if (value === "personal" || value === "professional") return value;
    if (value === "showreel" && hasShowreels) return "showreel";
    return null;
  }, [searchParams, hasShowreels]);

  const defaultFilter: FilterValue = hasShowreels ? "showreel" : "professional";

  const [filter, setFilter] = useState<FilterValue>(
    () => paramFilter ?? defaultFilter,
  );

  useEffect(() => {
    if (paramFilter) setFilter(paramFilter);
  }, [paramFilter]);

  const counts = {
    showreel: showreelProjects.length,
    professional: gridProjects.filter(
      (p) => (p.projectType ?? "professional") === "professional",
    ).length,
    personal: gridProjects.filter((p) => p.projectType === "personal").length,
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
        <ProjectFilter
          value={filter}
          onChange={setFilter}
          counts={counts}
          hasShowreel={hasShowreels}
        />
      </div>
      {filter === "showreel" ? (
        <ShowreelList key="showreel" projects={showreelProjects} />
      ) : (
        <FilteredProjectGrid
          key={filter}
          projects={gridProjects}
          filter={filter}
          locale={locale}
        />
      )}
    </>
  );
}
