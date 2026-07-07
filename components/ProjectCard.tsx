"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { urlFor } from "@/lib/sanity/image";
import type { SanityProject } from "@/lib/sanity/queries";

interface ProjectCardProps {
  project: SanityProject;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const imageUrl = urlFor(project.thumbnail)
    .width(900)
    .height(600)
    .fit("crop")
    .url();

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link href={`/project/${project.slug.current}`} className="group block">
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-900">
          <Image
            src={imageUrl}
            alt={project.thumbnail.alt ?? project.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/30" />
          <div className="absolute inset-x-0 bottom-0 translate-y-4 p-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">
              {project.client}
              {project.year ? ` · ${project.year}` : ""}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium tracking-tight transition-opacity group-hover:opacity-60 md:text-xl">
              {project.title}
            </h2>
            {project.tags && project.tags.length > 0 && (
              <p className="mt-1 text-xs uppercase tracking-wider text-neutral-500">
                {project.tags.slice(0, 3).join(" · ")}
              </p>
            )}
          </div>
          <span className="text-xs text-neutral-600 transition-colors group-hover:text-neutral-400">
            →
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
