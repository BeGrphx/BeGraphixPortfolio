"use client";

import { useEffect, useState, type ReactNode } from "react";
import { VideoBackground } from "./VideoBackground";

export interface HeroBackgroundProps {
  type: "video" | "organic" | "none";
  videoUrl?: string;
  videoBlur?: number;
  bottomFade?: number;
}

const PAGE_BG = "#080808";

function buildSmoothFade(height: number) {
  return `linear-gradient(
    180deg,
    rgba(8, 8, 8, 0) 0%,
    rgba(8, 8, 8, 0) 18%,
    rgba(8, 8, 8, 0.018) 30%,
    rgba(8, 8, 8, 0.045) 40%,
    rgba(8, 8, 8, 0.085) 48%,
    rgba(8, 8, 8, 0.14) 55%,
    rgba(8, 8, 8, 0.21) 61%,
    rgba(8, 8, 8, 0.3) 67%,
    rgba(8, 8, 8, 0.41) 72%,
    rgba(8, 8, 8, 0.53) 77%,
    rgba(8, 8, 8, 0.65) 82%,
    rgba(8, 8, 8, 0.76) 87%,
    rgba(8, 8, 8, 0.86) 92%,
    rgba(8, 8, 8, 0.94) 96%,
    ${PAGE_BG} 100%
  )`;
}

function HeroBottomFade({ height }: { height: number }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5]"
        style={{
          height,
          background: buildSmoothFade(height),
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] opacity-70"
        style={{
          height: height * 0.65,
          background: `linear-gradient(180deg, transparent 0%, ${PAGE_BG} 100%)`,
          filter: "blur(18px)",
          transform: "translateY(12px)",
        }}
      />
    </>
  );
}

export function HeroBackground({
  type,
  videoUrl,
  videoBlur = 10,
  bottomFade = 280,
}: HeroBackgroundProps) {
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => setVideoFailed(false), [videoUrl, type]);

  const showVideo = type === "video" && Boolean(videoUrl) && !videoFailed;
  const showFade = type !== "none" && bottomFade > 0;

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
      <div className="absolute inset-0 overflow-hidden bg-neutral-950">
        <div
          className="animate-organic-spin absolute inset-[-45%] opacity-35"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 40%, var(--organic-a) 0%, transparent 45%), radial-gradient(circle at 70% 60%, var(--organic-b) 0%, transparent 42%)",
          }}
        />
      </div>
    );
  } else {
    content = <div className="absolute inset-0 bg-neutral-950" />;
  }

  return (
    <div className="absolute inset-0">
      {content}
      {showFade && <HeroBottomFade height={bottomFade} />}
    </div>
  );
}
