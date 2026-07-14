/**
 * Visual effects suite — 100 % open-source (MIT).
 *
 * Enabled by default on all environments.
 * REVERT (for agent/user): set NEXT_PUBLIC_VISUAL_EFFECTS=false + redeploy.
 */

export type VisualEffectKey =
  | "heroShader"
  | "hero3d"
  | "heroParticles"
  | "cardTilt"
  | "pageTransition"
  | "splitHeadlines"
  | "cursorSpotlight"
  | "scrollParallax";

export function isVisualEffectsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_VISUAL_EFFECTS !== "false";
}

/** Desktop / pointer-fine — full effects */
export const VISUAL_EFFECTS_DESKTOP: Record<VisualEffectKey, boolean> = {
  heroShader: true,
  hero3d: true,
  heroParticles: true,
  cardTilt: true,
  pageTransition: true,
  splitHeadlines: true,
  cursorSpotlight: true,
  scrollParallax: true,
};

/** Mobile / coarse pointer — lightweight only */
export const VISUAL_EFFECTS_MOBILE: Record<VisualEffectKey, boolean> = {
  heroShader: false,
  hero3d: false,
  heroParticles: false,
  cardTilt: false,
  pageTransition: true,
  splitHeadlines: false,
  cursorSpotlight: false,
  scrollParallax: false,
};

/** prefers-reduced-motion — disable motion-heavy effects */
export const VISUAL_EFFECTS_REDUCED: Record<VisualEffectKey, boolean> = {
  heroShader: true,
  hero3d: false,
  heroParticles: false,
  cardTilt: false,
  pageTransition: true,
  splitHeadlines: false,
  cursorSpotlight: false,
  scrollParallax: false,
};

export function resolveVisualEffects(
  mobile: boolean,
  reducedMotion: boolean,
): Record<VisualEffectKey, boolean> {
  const base = mobile ? VISUAL_EFFECTS_MOBILE : VISUAL_EFFECTS_DESKTOP;
  if (!reducedMotion) return base;
  const resolved = { ...base };
  for (const key of Object.keys(VISUAL_EFFECTS_REDUCED) as VisualEffectKey[]) {
    if (!VISUAL_EFFECTS_REDUCED[key]) resolved[key] = false;
  }
  return resolved;
}

export function isEffectActive(
  key: VisualEffectKey,
  mobile: boolean,
  reducedMotion: boolean,
): boolean {
  if (!isVisualEffectsEnabled()) return false;
  return resolveVisualEffects(mobile, reducedMotion)[key];
}
