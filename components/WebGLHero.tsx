"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const WebGLCanvas = dynamic(
  () => import("./WebGLCanvas").then((m) => m.WebGLCanvas),
  { ssr: false },
);

export function WebGLHero() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isMobile = window.innerWidth < 768;
    setEnabled(!prefersReduced && !isMobile);
  }, []);

  if (!enabled) {
    return (
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-neutral-900/40 to-transparent dark:from-neutral-800/30" />
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 h-[70vh] opacity-60">
      <WebGLCanvas />
    </div>
  );
}
