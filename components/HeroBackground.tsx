"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const WebGLCanvas = dynamic(
  () => import("./WebGLCanvas").then((m) => m.WebGLCanvas),
  { ssr: false },
);

export interface HeroBackgroundProps {
  type: "video" | "webgl" | "none";
  videoUrl?: string;
}

export function HeroBackground({ type, videoUrl }: HeroBackgroundProps) {
  const { resolvedTheme } = useTheme();
  const [webglEnabled, setWebglEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setWebglEnabled(!prefersReduced);
  }, []);

  useEffect(() => {
    setVideoFailed(false);
  }, [videoUrl]);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";
  const showVideo = type === "video" && videoUrl && !videoFailed;

  if (showVideo) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <video
          key={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          onError={() => setVideoFailed(true)}
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-xl"
          src={videoUrl}
        />
        <div
          className={`absolute inset-0 ${isDark ? "bg-black/65" : "bg-white/70"}`}
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-background" />
      </div>
    );
  }

  if ((type === "webgl" || (type === "video" && videoFailed)) && webglEnabled) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 h-full w-full">
          <WebGLCanvas />
        </div>
        <div
          className={`absolute inset-0 ${isDark ? "bg-black/30" : "bg-white/40"}`}
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-background" />
      </div>
    );
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 ${
        isDark
          ? "bg-gradient-to-b from-neutral-900/40 to-transparent"
          : "bg-gradient-to-b from-neutral-200/50 to-transparent"
      }`}
    />
  );
}
