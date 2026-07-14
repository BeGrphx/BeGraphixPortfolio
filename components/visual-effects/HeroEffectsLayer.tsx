"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import { useVisualEffectsCapabilities } from "@/hooks/useVisualEffectsCapabilities";

const HeroWebGLCanvas = dynamic(
  () =>
    import("./HeroWebGLCanvas").then((mod) => mod.HeroWebGLCanvas),
  { ssr: false, loading: () => null },
);

export function HeroEffectsLayer() {
  const { enabled, effects } = useVisualEffectsCapabilities();
  const [mounted, setMounted] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);
  const lenis = useLenis();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!enabled || !effects.scrollParallax || !lenis) return;
    const onScroll = ({ scroll }: { scroll: number }) => {
      setParallaxY(scroll * 0.08);
    };
    lenis.on("scroll", onScroll);
    return () => lenis.off("scroll", onScroll);
  }, [enabled, effects.scrollParallax, lenis]);

  if (!mounted || !enabled) return null;

  const hasWebGL =
    effects.heroShader || effects.hero3d || effects.heroParticles;
  if (!hasWebGL) return null;

  return (
    <HeroWebGLCanvas
      showShader={effects.heroShader}
      show3d={effects.hero3d}
      showParticles={effects.heroParticles}
      parallaxY={parallaxY}
    />
  );
}
