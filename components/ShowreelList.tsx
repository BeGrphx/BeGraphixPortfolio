"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { formatProjectDateShort } from "@/lib/media";
import { preloadVideo, preloadVideosIdle } from "@/lib/preload-video";
import type { ProjectWithDisplay } from "@/lib/sanity/queries";
import { VideoPlayer } from "./VideoPlayer";

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

  const sources = projects
    .map((project) => getVideoUrl(project))
    .filter((url): url is string => Boolean(url));

  useEffect(() => {
    if (!sources.length) return;
    preloadVideo(sources[0], "auto");
    return preloadVideosIdle(sources.slice(1), "auto");
  }, [sources]);

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/20 px-8 py-16 text-center">
        <p className="text-white/70">{t("noShowreel")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 sm:gap-14 md:gap-20">
      {projects.map((project) => {
        const videoUrl = getVideoUrl(project);
        const theme = getTheme(project);

        return (
          <article key={project._id}>
            {videoUrl ? (
              <VideoPlayer
                src={videoUrl}
                title={project.displayTitle}
                preload="auto"
                className="w-full"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-neutral-900 text-sm text-white/40">
                {t("noShowreelVideo")}
              </div>
            )}
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
          </article>
        );
      })}
    </div>
  );
}
