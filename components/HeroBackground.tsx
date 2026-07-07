"use client";

import { useEffect, useState, type ReactNode } from "react";
import { VideoBackground } from "./VideoBackground";

export interface HeroBackgroundProps {
  type: "video" | "organic" | "none";
  videoUrl?: string;
  videoBlur?: number;
  bottomFade?: number;
}

function HeroBottomFade({ height }: { height: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[5]"
      style={{
        height,
        background: `linear-gradient(
          to bottom,
          transparent 0%,
          color-mix(in srgb, var(--color-background) 15%, transparent) 25%,
          color-mix(in srgb, var(--color-background) 55%, transparent) 55%,
          color-mix(in srgb, var(--color-background) 85%, transparent) 80%,
          var(--color-background) 100%
        )`,
      }}
    />
  );
}

export function HeroBackground({
  type,
  videoUrl,
  videoBlur = 10,
  bottomFade = 220,
}: HeroBackgroundProps) {
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => setVideoFailed(false), [videoUrl, type]);

  const showVideo = type === "video" && Boolean(videoUrl) && !videoFailed;
  const showFade = type !== "none" && bottomFade > 0;

  const maskStyle =
    showFade
      ? {
          WebkitMaskImage: `linear-gradient(to bottom, black 0%, black calc(100% - ${bottomFade}px), transparent 100%)`,
          maskImage: `linear-gradient(to bottom, black 0%, black calc(100% - ${bottomFade}px), transparent 100%)`,
        }
      : undefined;

  let content: ReactNode;

  if (showVideo && videoUrl) {
    content = (
      <VideoBackground
        url={videoUrl}
        blur={videoBlur}
        onError={() => setVideoFailed(true)}
      />
    );
  } else if (type === "organic") {
    content = (
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
  } else {
    content = (
      <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-950" />
    );
  }

  return (
    <div className="absolute inset-0" style={maskStyle}>
      {content}
      {showFade && <HeroBottomFade height={bottomFade} />}
    </div>
  );
}
