"use client";

import { useEffect, useState, type ReactNode } from "react";
import { HeroEffectsLayer } from "@/components/visual-effects/HeroEffectsLayer";
import { useVisualEffectsCapabilities } from "@/hooks/useVisualEffectsCapabilities";
import { VideoBackground } from "./VideoBackground";

export interface HeroBackgroundProps {
  type: "video" | "organic" | "none";
  videoUrl?: string;
  videoBlur?: number;
  bottomFade?: number;
}

const PAGE_BG = "#080808";

function buildHeroMask(fadePercent: number) {
  const start = 100 - fadePercent;
  return `linear-gradient(
    180deg,
    #000 0%,
    #000 ${start}%,
    rgba(0, 0, 0, 0.985) ${start + fadePercent * 0.12}%,
    rgba(0, 0, 0, 0.96) ${start + fadePercent * 0.22}%,
    rgba(0, 0, 0, 0.92) ${start + fadePercent * 0.32}%,
    rgba(0, 0, 0, 0.86) ${start + fadePercent * 0.42}%,
    rgba(0, 0, 0, 0.78) ${start + fadePercent * 0.52}%,
    rgba(0, 0, 0, 0.68) ${start + fadePercent * 0.62}%,
    rgba(0, 0, 0, 0.55) ${start + fadePercent * 0.72}%,
    rgba(0, 0, 0, 0.38) ${start + fadePercent * 0.82}%,
    rgba(0, 0, 0, 0.18) ${start + fadePercent * 0.92}%,
    transparent 100%
  )`;
}

function buildOverlayFade(fadePercent: number) {
  const start = 100 - fadePercent;
  return `linear-gradient(
    180deg,
    rgba(8, 8, 8, 0) 0%,
    rgba(8, 8, 8, 0) ${start}%,
    rgba(8, 8, 8, 0.12) ${start + fadePercent * 0.2}%,
    rgba(8, 8, 8, 0.32) ${start + fadePercent * 0.4}%,
    rgba(8, 8, 8, 0.55) ${start + fadePercent * 0.6}%,
    rgba(8, 8, 8, 0.78) ${start + fadePercent * 0.8}%,
    ${PAGE_BG} 100%
  )`;
}

export function HeroBackground({
  type,
  videoUrl,
  videoBlur = 10,
  bottomFade = 320,
}: HeroBackgroundProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const { enabled: effectsEnabled, effects } = useVisualEffectsCapabilities();
  const useWebGLHero =
    effectsEnabled &&
    (effects.heroShader || effects.hero3d || effects.heroParticles);

  useEffect(() => setVideoFailed(false), [videoUrl, type]);

  const showVideo = type === "video" && Boolean(videoUrl) && !videoFailed;
  const fadePercent = Math.min(55, Math.max(28, bottomFade / 12));

  const maskStyle = {
    WebkitMaskImage: buildHeroMask(fadePercent),
    maskImage: buildHeroMask(fadePercent),
  };

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
    content = useWebGLHero ? (
      <div className="absolute inset-0 overflow-hidden bg-neutral-950">
        <HeroEffectsLayer />
      </div>
    ) : (
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
    content = (
      <div className="absolute inset-0 bg-neutral-950">
        {useWebGLHero ? <HeroEffectsLayer /> : null}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-[#080808]">
      <div className="absolute inset-0" style={maskStyle}>
        {content}
        {showVideo && useWebGLHero ? (
          <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen">
            <HeroEffectsLayer />
          </div>
        ) : null}
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: buildOverlayFade(fadePercent) }}
      />
    </div>
  );
}
