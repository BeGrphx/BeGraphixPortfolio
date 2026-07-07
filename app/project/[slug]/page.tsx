import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FadeIn } from "@/components/FadeIn";
import { VideoEmbed } from "@/components/VideoEmbed";
import { client } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
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

  const imageUrl = urlFor(project.thumbnail)
    .width(1600)
    .height(900)
    .fit("crop")
    .url();

  return (
    <div className="min-h-screen px-6 pb-24 pt-32 md:px-10 md:pt-40">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <Link
            href="/"
            className="mb-12 inline-block text-xs uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-neutral-300"
          >
            ← Retour
          </Link>
        </FadeIn>

        <FadeIn delay={0.05}>
          <header className="mb-12 max-w-3xl">
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-neutral-500">
              {project.client}
              {project.year ? ` · ${project.year}` : ""}
            </p>
            <h1 className="text-4xl font-medium tracking-tight md:text-5xl lg:text-6xl">
              {project.title}
            </h1>
            {project.tags && project.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
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

        <FadeIn delay={0.1}>
          <div className="relative mb-16 aspect-video overflow-hidden bg-neutral-900">
            <Image
              src={imageUrl}
              alt={project.thumbnail.alt ?? project.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        </FadeIn>

        {project.description && (
          <FadeIn delay={0.15}>
            <p className="mb-16 max-w-2xl text-lg leading-relaxed text-neutral-400">
              {project.description}
            </p>
          </FadeIn>
        )}

        {project.videos && project.videos.length > 0 && (
          <div className="space-y-12">
            {project.videos.map((video, index) => (
              <VideoEmbed
                key={`${video.vimeoUrl}-${index}`}
                url={video.vimeoUrl}
                title={video.title}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
