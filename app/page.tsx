import { FadeIn } from "@/components/FadeIn";
import { ProjectGrid } from "@/components/ProjectGrid";
import { client } from "@/lib/sanity/client";
import { projectsQuery, type SanityProject } from "@/lib/sanity/queries";

export const revalidate = 60;

async function getProjects(): Promise<SanityProject[]> {
  try {
    return await client.fetch(projectsQuery);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const projects = await getProjects();

  return (
    <div className="min-h-screen px-6 pb-24 pt-32 md:px-10 md:pt-40">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <div className="mb-16 max-w-2xl md:mb-24">
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-neutral-500">
              Motion Design · Vidéo IA
            </p>
            <h1 className="text-4xl font-medium leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Créations visuelles
              <br />
              <span className="text-neutral-500">animées &amp; augmentées</span>
            </h1>
          </div>
        </FadeIn>

        <ProjectGrid projects={projects} />
      </div>
    </div>
  );
}
