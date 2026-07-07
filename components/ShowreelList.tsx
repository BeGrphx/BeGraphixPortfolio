"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { formatProjectDateShort } from "@/lib/media";
import type { ProjectWithDisplay } from "@/lib/sanity/queries";

interface ShowreelListProps {
  projects: ProjectWithDisplay[];
}

function getVideoUrl(project: ProjectWithDisplay): string | undefined {
  return project.showreelVideoUrl || project.hoverPreviewUrl || undefined;
}

function getTheme(project: ProjectWithDisplay): string {
  if (project.tags?.length) return project.tags.slice(0, 3).join(" · ");
  return project.client ?? "";
}

export function ShowreelList({ projects }: ShowreelListProps) {
  const t = useTranslations("home");

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/20 px-8 py-16 text-center">
        <p className="text-white/70">{t("noShowreel")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-14 md:gap-20">
      {projects.map((project, index) => {
        const videoUrl = getVideoUrl(project);
        const theme = getTheme(project);

        return (
          <motion.article
            key={project._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.45,
              delay: index * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="relative aspect-video overflow-hidden bg-neutral-900">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-white/40">
                  {t("noShowreelVideo")}
                </div>
              )}
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium tracking-tight text-white md:text-xl">
                  {project.displayTitle}
                </h2>
                {(theme || project.completedAt) && (
                  <p className="mt-1 text-xs uppercase tracking-wider text-white/50">
                    {theme}
                    {theme && project.completedAt ? " · " : ""}
                    {project.completedAt
                      ? formatProjectDateShort(project.completedAt)
                      : ""}
                  </p>
                )}
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
