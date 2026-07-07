"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { SanityProject } from "@/lib/sanity/queries";
import { ProjectCard } from "./ProjectCard";
import type { FilterValue } from "./ProjectFilter";

interface FilteredProjectGridProps {
  projects: SanityProject[];
  filter: FilterValue;
}

export function FilteredProjectGrid({
  projects,
  filter,
}: FilteredProjectGridProps) {
  const filtered =
    filter === "all"
      ? projects
      : projects.filter(
          (p) => (p.projectType ?? "professional") === filter,
        );

  if (filtered.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-lg border border-dashed border-neutral-800 px-8 py-16 text-center"
      >
        <p className="text-neutral-400">Aucun projet dans cette catégorie.</p>
      </motion.div>
    );
  }

  return (
    <motion.div layout className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2">
      <AnimatePresence mode="popLayout">
        {filtered.map((project, index) => (
          <ProjectCard key={project._id} project={project} index={index} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
