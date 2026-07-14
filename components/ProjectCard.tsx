"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { formatProjectDateShort } from "@/lib/media";
import type { Locale } from "@/i18n/routing";
import type { ProjectWithDisplay } from "@/lib/sanity/queries";
import {
  buildImageSrc,
  isUltrawide,
} from "@/lib/sanity/image-utils";

interface ProjectCardProps {
  project: ProjectWithDisplay;
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

export function ProjectCard({ project, locale }: ProjectCardProps) {
  const ref = useRef<HTMLElement>(null);
  const [hovering, setHovering] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const title = project.displayTitle;

  const imageUrl = project.thumbnail
    ? buildImageSrc(project.thumbnail, 1280)
    : null;

  const wideThumbnail = project.thumbnail
    ? isUltrawide(project.thumbnail)
    : false;

  const hoverSrc = project.hoverPreviewUrl
    ? getHoverVideoSrc(project.hoverPreviewUrl)
    : null;
  const isMp4 = hoverSrc?.includes(".mp4");

  return (
    <article ref={ref}>
      <Link
        href={`/project/${project.slug.current}`}
        className="group block"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={project.thumbnail?.alt ?? title}
              fill
              onLoad={() => setImageLoaded(true)}
              className={`transition-all duration-700 ease-out ${
                wideThumbnail ? "object-contain" : "object-cover group-hover:scale-105"
              } ${imageLoaded ? "opacity-100" : "opacity-0"} ${
                hovering && hoverSrc ? "opacity-0" : ""
              }`}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : null}
          {hovering && hoverSrc && isMp4 && (
            <video
              src={hoverSrc}
              autoPlay
              muted
              loop
              playsInline
              className={`absolute inset-0 h-full w-full ${
                wideThumbnail ? "object-contain" : "object-cover"
              }`}
            />
          )}
          {hovering && hoverSrc && !isMp4 && (
            <iframe
              src={hoverSrc}
              title={`${title} preview`}
              className={`pointer-events-none absolute inset-0 h-full w-full scale-110 ${
                wideThumbnail ? "object-contain" : "object-cover"
              }`}
              allow="autoplay; fullscreen"
            />
          )}
          <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/20" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-100 md:translate-y-4 md:from-transparent md:p-6 md:opacity-0 md:transition-all md:duration-500 md:group-hover:translate-y-0 md:group-hover:opacity-100">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/80 sm:text-xs sm:tracking-[0.2em] md:text-white/70">
              {project.client}
              {project.completedAt
                ? ` · ${formatProjectDateShort(project.completedAt)}`
                : ""}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-start justify-between gap-3 sm:mt-4 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-medium leading-snug tracking-tight text-white transition-opacity group-hover:opacity-60 sm:text-lg md:text-xl">
              {title}
            </h2>
            {project.tags && project.tags.length > 0 && (
              <p className="mt-1 text-[10px] uppercase tracking-wider text-white/50 sm:text-xs">
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
    </article>
  );
}
