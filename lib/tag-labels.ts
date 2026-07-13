import type { Locale } from "@/i18n/routing";

const TAG_LABELS: Record<string, Record<Locale, string>> = {
  PUB: { fr: "Pub", en: "Ad", es: "Publicidad" },
  TV: { fr: "TV", en: "TV", es: "TV" },
  CLIP: { fr: "Clip", en: "Music video", es: "Videoclip" },
  VFX: { fr: "VFX", en: "VFX", es: "VFX" },
  PHARMA: { fr: "Pharma", en: "Pharma", es: "Farmacéutica" },
  SHOWREEL: { fr: "Showreel", en: "Showreel", es: "Showreel" },
  "MOTION DESIGN": {
    fr: "Motion Design",
    en: "Motion Design",
    es: "Motion Design",
  },
  "VIDÉO IA": { fr: "Vidéo IA", en: "AI Video", es: "Vídeo IA" },
  "VIDEO IA": { fr: "Vidéo IA", en: "AI Video", es: "Vídeo IA" },
};

function normalizeTagKey(tag: string) {
  return tag.trim().replace(/\s+/g, " ");
}

export function getKnownTagLabel(tag: string, locale: Locale): string | null {
  const key = normalizeTagKey(tag).toUpperCase();
  return TAG_LABELS[key]?.[locale] ?? null;
}

export function shouldKeepTagAsIs(tag: string) {
  const normalized = normalizeTagKey(tag);
  if (!normalized) return true;
  if (/^[A-Z0-9]{2,5}$/.test(normalized)) return true;
  return normalized.length <= 3;
}
