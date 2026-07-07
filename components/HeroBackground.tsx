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

  useEffect(() => {
    setMounted(true);
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setWebglEnabled(!prefersReduced);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  if (type === "video" && videoUrl) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
          src={videoUrl}
        />
        <div
          className={`absolute inset-0 ${
            isDark ? "bg-black/70" : "bg-white/75"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>
    );
  }

  if (type === "webgl" && webglEnabled) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-70 dark:opacity-50">
        <WebGLCanvas />
        <div
          className={`absolute inset-0 ${
            isDark ? "bg-black/40" : "bg-white/50"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>
    );
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 ${
        isDark
          ? "bg-gradient-to-b from-neutral-900/50 to-transparent"
          : "bg-gradient-to-b from-neutral-200/60 to-transparent"
      }`}
    />
  );
}
