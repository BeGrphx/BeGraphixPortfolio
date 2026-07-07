"use client";

import { useEffect, useState } from "react";
import { VideoBackground } from "./VideoBackground";

export interface HeroBackgroundProps {
  type: "video" | "organic" | "none";
  videoUrl?: string;
}

export function HeroBackground({ type, videoUrl }: HeroBackgroundProps) {
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => setVideoFailed(false), [videoUrl, type]);

  const showVideo = type === "video" && Boolean(videoUrl) && !videoFailed;

  if (showVideo && videoUrl) {
    return (
      <VideoBackground url={videoUrl} onError={() => setVideoFailed(true)} />
    );
  }

  if (type === "organic") {
    return (
      <div className="absolute inset-0 overflow-hidden bg-neutral-100 dark:bg-neutral-950">
        <div
          className="animate-organic-spin absolute inset-[-45%] opacity-35 dark:opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 40%, var(--organic-a) 0%, transparent 45%), radial-gradient(circle at 70% 60%, var(--organic-b) 0%, transparent 42%)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-950" />
  );
}
