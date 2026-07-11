"use client";

import type { SanityVideoItem } from "@/lib/sanity/queries";
import { VideoPlayer } from "./VideoPlayer";

interface VideoGalleryProps {
  videos: SanityVideoItem[];
}

export function VideoGallery({ videos }: VideoGalleryProps) {
  if (!videos.length) return null;

  return (
    <div className="mb-12 space-y-8 sm:mb-16 sm:space-y-10">
      {videos.map((video) => {
        if (!video.videoUrl) return null;

        return (
          <VideoPlayer
            key={video._key}
            src={video.videoUrl}
            poster={video.posterUrl}
            title={video.title}
            preload="metadata"
            className="w-full rounded-sm"
          />
        );
      })}
    </div>
  );
}
