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
  const [mounted, setMounted] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setVideoFailed(false);
  }, [videoUrl]);

  if (!mounted) {
    return <div className="absolute inset-0 bg-background" />;
  }

  const isDark = resolvedTheme === "dark";
  const showVideo = type === "video" && Boolean(videoUrl) && !videoFailed;

  if (showVideo && videoUrl) {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <video
          key={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setVideoFailed(true)}
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-2xl"
          src={videoUrl}
        />
        <div className={`absolute inset-0 ${isDark ? "bg-black/60" : "bg-white/65"}`} />
      </div>
    );
  }

  if (type === "webgl" && !showVideo) {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 h-full w-full scale-110">
          <WebGLCanvas />
        </div>
        <div className={`absolute inset-0 ${isDark ? "bg-black/25" : "bg-white/35"}`} />
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-0 ${
        isDark ? "bg-neutral-950" : "bg-neutral-100"
      }`}
    />
  );
}
