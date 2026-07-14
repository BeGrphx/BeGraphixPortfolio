"use client";

import { useEffect, useState } from "react";
import { useVisualEffect } from "@/hooks/useVisualEffectsCapabilities";

export function CursorSpotlight() {
  const enabled = useVisualEffect("cursorSpotlight");
  const [position, setPosition] = useState({ x: 50, y: 30 });

  useEffect(() => {
    if (!enabled) return;
    const onMove = (event: MouseEvent) => {
      setPosition({
        x: (event.clientX / window.innerWidth) * 100,
        y: (event.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[5] opacity-40 mix-blend-screen transition-opacity duration-300"
      style={{
        background: `radial-gradient(circle 420px at ${position.x}% ${position.y}%, rgba(167, 139, 250, 0.18), transparent 65%)`,
      }}
    />
  );
}
