export type MediaType =
  | "file"
  | "youtube"
  | "vimeo"
  | "instagram"
  | "linkedin"
  | "link"
  | "mux";

export interface ParsedMedia {
  kind: "embed" | "link";
  embedUrl?: string;
  href: string;
  aspectRatio?: "video" | "instagram";
}

export function parseMediaUrl(
  url: string,
  mediaType: MediaType,
): ParsedMedia | null {
  if (!url) return null;

  switch (mediaType) {
    case "youtube":
      return parseYouTube(url);
    case "vimeo":
      return parseVimeo(url);
    case "instagram":
      return parseInstagram(url);
    case "linkedin":
    case "link":
      return { kind: "link", href: url };
    default:
      return { kind: "link", href: url };
  }
}

function parseYouTube(url: string): ParsedMedia | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return {
        kind: "embed",
        embedUrl: `https://www.youtube.com/embed/${match[1]}?rel=0`,
        href: url,
        aspectRatio: "video",
      };
    }
  }

  return null;
}

function parseVimeo(url: string): ParsedMedia | null {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return {
        kind: "embed",
        embedUrl: `https://player.vimeo.com/video/${match[1]}?autoplay=0&title=0&byline=0&portrait=0`,
        href: url,
        aspectRatio: "video",
      };
    }
  }

  return null;
}

function parseInstagram(url: string): ParsedMedia | null {
  const postMatch = url.match(
    /instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/,
  );

  if (postMatch?.[1]) {
    const path = url.includes("/reel/")
      ? "reel"
      : url.includes("/tv/")
        ? "tv"
        : "p";
    return {
      kind: "embed",
      embedUrl: `https://www.instagram.com/${path}/${postMatch[1]}/embed`,
      href: url,
      aspectRatio: "instagram",
    };
  }

  return { kind: "link", href: url };
}

export function formatProjectDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatProjectDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("fr-FR", {
    month: "short",
    year: "numeric",
  }).format(date);
}
