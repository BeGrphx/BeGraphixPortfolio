"use client";

import { useState } from "react";
import type { SanityProject } from "@/lib/sanity/queries";
import { FilteredProjectGrid } from "./FilteredProjectGrid";
import { ProjectFilter, type FilterValue } from "./ProjectFilter";

interface ProjectGridProps {
  projects: SanityProject[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  const [filter, setFilter] = useState<FilterValue>("professional");

  const counts = {
    professional: projects.filter(
      (p) => (p.projectType ?? "professional") === "professional",
    ).length,
    personal: projects.filter((p) => p.projectType === "personal").length,
  };

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-800 px-8 py-16 text-center">
        <p className="text-neutral-400">Aucun projet pour le moment.</p>
        <p className="mt-2 text-sm text-neutral-600">
          Ajoutez des projets via{" "}
          <a href="/studio" className="underline hover:text-neutral-400">
            Sanity Studio
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <>
      <ProjectFilter value={filter} onChange={setFilter} counts={counts} />
      <FilteredProjectGrid projects={projects} filter={filter} />
    </>
  );
}
