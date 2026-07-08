"use client";

import { useEffect } from "react";
import type { SanityVideoItem } from "@/lib/sanity/queries";
import { preloadVideo, preloadVideosIdle } from "@/lib/preload-video";
import { VideoPlayer } from "./VideoPlayer";

interface VideoGalleryProps {
  videos: SanityVideoItem[];
}

export function VideoGallery({ videos }: VideoGalleryProps) {
  const sources = videos
    .map((video) => video.videoUrl)
    .filter((url): url is string => Boolean(url));

  useEffect(() => {
    if (!sources.length) return;

    preloadVideo(sources[0], "auto");
    return preloadVideosIdle(sources.slice(1), "auto");
  }, [sources]);

  if (!videos.length) return null;

  return (
    <div className="mb-16 space-y-10">
      {videos.map((video) => {
        if (!video.videoUrl) return null;

        return (
          <VideoPlayer
            key={video._key}
            src={video.videoUrl}
            poster={video.posterUrl}
            title={video.title}
            preload="auto"
            className="w-full rounded-sm"
          />
        );
      })}
    </div>
  );
}
