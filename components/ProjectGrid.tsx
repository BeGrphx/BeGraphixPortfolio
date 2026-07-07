import type { SanityProject } from "@/lib/sanity/queries";
import { ProjectCard } from "./ProjectCard";

interface ProjectGridProps {
  projects: SanityProject[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
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
    <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2">
      {projects.map((project, index) => (
        <ProjectCard key={project._id} project={project} index={index} />
      ))}
    </div>
  );
}
