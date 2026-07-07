"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { formatProjectDateShort } from "@/lib/media";
import type { Locale } from "@/i18n/routing";
import type { ProjectWithDisplay } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";

interface ProjectCardProps {
  project: ProjectWithDisplay;
  index: number;
  locale: Locale;
}

function getHoverVideoSrc(url: string): string | null {
  if (url.endsWith(".mp4") || url.includes(".mp4?")) return url;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo?.[1]) {
    return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&muted=1&loop=1&background=1`;
  }
  return null;
}

export function ProjectCard({ project, index, locale }: ProjectCardProps) {
  const ref = useRef<HTMLElement>(null);
  const [hovering, setHovering] = useState(false);
  const title = project.displayTitle;

  const imageUrl = urlFor(project.thumbnail)
    .width(900)
    .height(600)
    .fit("crop")
    .url();

  const hoverSrc = project.hoverPreviewUrl
    ? getHoverVideoSrc(project.hoverPreviewUrl)
    : null;
  const isMp4 = hoverSrc?.includes(".mp4");

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        href={`/project/${project.slug.current}`}
        className="group block"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-900">
          <Image
            src={imageUrl}
            alt={project.thumbnail.alt ?? title}
            fill
            className={`object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
              hovering && hoverSrc ? "opacity-0" : "opacity-100"
            }`}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {hovering && hoverSrc && isMp4 && (
            <video
              src={hoverSrc}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          {hovering && hoverSrc && !isMp4 && (
            <iframe
              src={hoverSrc}
              className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover"
              allow="autoplay; fullscreen"
            />
          )}
          <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/20" />
          <div className="absolute inset-x-0 bottom-0 translate-y-4 p-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">
              {project.client}
              {project.completedAt
                ? ` · ${formatProjectDateShort(project.completedAt)}`
                : ""}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium tracking-tight text-white transition-opacity group-hover:opacity-60 md:text-xl">
              {title}
            </h2>
            {project.tags && project.tags.length > 0 && (
              <p className="mt-1 text-xs uppercase tracking-wider text-white/50">
                {project.tags.slice(0, 3).join(" · ")}
              </p>
            )}
          </div>
          <motion.span
            className="text-xs text-white/50"
            whileHover={{ x: 4 }}
          >
            →
          </motion.span>
        </div>
      </Link>
    </motion.article>
  );
}
