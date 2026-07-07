import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FadeIn } from "@/components/FadeIn";
import { MediaBlock } from "@/components/MediaBlock";
import { PhotoGallery } from "@/components/PhotoGallery";
import { formatProjectDate } from "@/lib/media";
import { client } from "@/lib/sanity/client";
import {
  projectBySlugQuery,
  projectSlugsQuery,
  type SanityProject,
} from "@/lib/sanity/queries";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProject(slug: string): Promise<SanityProject | null> {
  try {
    return await client.fetch(projectBySlugQuery, { slug });
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const slugs: { slug: string }[] = await client.fetch(projectSlugsQuery);
    return slugs.map(({ slug }) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Projet introuvable" };

  return {
    title: project.title,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) notFound();

  return (
    <div className="min-h-screen px-6 pb-24 pt-32 md:px-10 md:pt-40">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <header className="mb-12 text-center md:mb-16">
            <h1 className="text-3xl font-medium leading-tight tracking-tight md:text-5xl lg:text-6xl">
              {project.title}
            </h1>
            {(project.client || project.completedAt) && (
              <p className="mt-4 text-xs uppercase tracking-[0.25em] text-neutral-500">
                {[project.client, project.completedAt && formatProjectDate(project.completedAt)]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            {project.tags && project.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-neutral-800 px-3 py-1 text-xs uppercase tracking-wider text-neutral-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>
        </FadeIn>

        {project.gallery && project.gallery.length > 0 && (
          <PhotoGallery images={project.gallery} />
        )}

        {project.description && (
          <FadeIn delay={0.1}>
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="whitespace-pre-line text-base leading-relaxed text-neutral-300 md:text-lg">
                {project.description}
              </p>
            </div>
          </FadeIn>
        )}

        {project.credits && (
          <FadeIn delay={0.12}>
            <p className="mx-auto mb-16 max-w-xl text-center text-xs leading-relaxed text-neutral-600">
              {project.credits}
            </p>
          </FadeIn>
        )}

        {project.media && project.media.length > 0 && (
          <div className="space-y-12 border-t border-neutral-900 pt-12">
            {project.media.map((item, index) => (
              <MediaBlock key={item._key} item={item} index={index} />
            ))}
          </div>
        )}

        <FadeIn delay={0.2}>
          <div className="mt-20 flex justify-center border-t border-neutral-900 pt-12">
            <Link
              href="/"
              className="inline-block border border-neutral-700 px-10 py-3 text-xs uppercase tracking-[0.25em] text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-200"
            >
              Home
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
