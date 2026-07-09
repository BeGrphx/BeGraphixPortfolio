"use client";

import { useLenis } from "lenis/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import type { ProjectWithDisplay } from "@/lib/sanity/queries";
import { getScrollY, restoreScrollPosition } from "@/lib/scroll";
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
  const lenis = useLenis();

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

  const contentRef = useRef<HTMLDivElement>(null);
  const pendingScrollRef = useRef<number | null>(null);
  const [contentMinHeight, setContentMinHeight] = useState<number | undefined>();

  useEffect(() => {
    if (paramFilter) setFilter(paramFilter);
  }, [paramFilter]);

  const handleFilterChange = useCallback(
    (value: FilterValue) => {
      if (value === filter) return;

      const container = contentRef.current;
      if (container) {
        setContentMinHeight(container.offsetHeight);
      }

      pendingScrollRef.current = getScrollY(lenis);
      setFilter(value);
    },
    [filter, lenis],
  );

  useLayoutEffect(() => {
    if (pendingScrollRef.current === null) return;

    const targetY = pendingScrollRef.current;
    pendingScrollRef.current = null;

    restoreScrollPosition(lenis, targetY);

    const frame = requestAnimationFrame(() => {
      setContentMinHeight(undefined);
      restoreScrollPosition(lenis, targetY);
    });

    return () => cancelAnimationFrame(frame);
  }, [filter, lenis]);

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
          onChange={handleFilterChange}
          counts={counts}
          hasShowreel={hasShowreels}
        />
      </div>
      <div
        ref={contentRef}
        className="[overflow-anchor:none]"
        style={contentMinHeight ? { minHeight: contentMinHeight } : undefined}
      >
        {filter === "showreel" ? (
          <ShowreelList projects={showreelProjects} />
        ) : (
          <FilteredProjectGrid
            projects={gridProjects}
            filter={filter}
            locale={locale}
          />
        )}
      </div>
    </>
  );
}
