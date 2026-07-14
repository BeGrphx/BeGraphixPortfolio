"use client";

import { useEffect, useState } from "react";
import {
  isVisualEffectsEnabled,
  resolveVisualEffects,
  type VisualEffectKey,
} from "@/lib/visual-effects-config";

export interface VisualEffectsCapabilities {
  enabled: boolean;
  mobile: boolean;
  reducedMotion: boolean;
  effects: Record<VisualEffectKey, boolean>;
}

const DEFAULT: VisualEffectsCapabilities = {
  enabled: false,
  mobile: true,
  reducedMotion: false,
  effects: resolveVisualEffects(true, false),
};

export function useVisualEffectsCapabilities(): VisualEffectsCapabilities {
  const [caps, setCaps] = useState<VisualEffectsCapabilities>(DEFAULT);

  useEffect(() => {
    const enabled = isVisualEffectsEnabled();
    const mobileQuery = window.matchMedia(
      "(max-width: 768px), (pointer: coarse)",
    );
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      const mobile = mobileQuery.matches;
      const reducedMotion = motionQuery.matches;
      setCaps({
        enabled,
        mobile,
        reducedMotion,
        effects: enabled
          ? resolveVisualEffects(mobile, reducedMotion)
          : resolveVisualEffects(true, false),
      });
    };

    sync();
    mobileQuery.addEventListener("change", sync);
    motionQuery.addEventListener("change", sync);
    return () => {
      mobileQuery.removeEventListener("change", sync);
      motionQuery.removeEventListener("change", sync);
    };
  }, []);

  return caps;
}

export function useVisualEffect(key: VisualEffectKey): boolean {
  const { enabled, effects } = useVisualEffectsCapabilities();
  return enabled && effects[key];
}
