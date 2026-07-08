import type { Locale } from "@/i18n/routing";
import type { LocalizedValue } from "@/lib/i18n";
import type { MediaType } from "@/lib/media";

export interface SanityGalleryImage {
  asset: { _ref: string };
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

const imageDimensions = `"width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height`;

export interface SanityMediaItem {
  _key: string;
  mediaType: MediaType;
  url?: string;
  muxPlaybackId?: string;
  title?: string;
  label?: string;
}

export type ProjectType = "showreel" | "professional" | "personal";

export interface SanityProject {
  _id: string;
  title: LocalizedValue | string;
  slug: { current: string };
  projectType?: ProjectType;
  client?: string;
  completedAt?: string;
  duration?: string;
  description?: LocalizedValue | string;
  credits?: LocalizedValue | string;
  tags?: string[];
  dominantColor?: string;
  thumbnail?: SanityGalleryImage;
  hoverPreviewUrl?: string;
  showreelVideoUrl?: string;
  gallery?: SanityGalleryImage[];
  pdfFile?: { asset: { _ref: string; url?: string } };
  media?: SanityMediaItem[];
}

export interface SanityAbout {
  title?: LocalizedValue | string;
  bio?: LocalizedValue | string;
  email?: string;
  socialLinks?: { label: string; url: string }[];
}

export const projectsQuery = `*[_type == "project"] | order(completedAt desc) {
  _id,
  title,
  slug,
  projectType,
  client,
  completedAt,
  duration,
  description,
  tags,
  dominantColor,
  "thumbnail": thumbnail {
    ...,
    ${imageDimensions}
  },
  hoverPreviewUrl,
  "showreelVideoUrl": coalesce(showreelVideoUrl, showreelVideoFile.asset->url)
}`;

export const projectBySlugQuery = `*[_type == "project" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  projectType,
  client,
  completedAt,
  duration,
  description,
  credits,
  tags,
  dominantColor,
  "thumbnail": thumbnail {
    ...,
    ${imageDimensions}
  },
  hoverPreviewUrl,
  "gallery": gallery[] {
    ...,
    ${imageDimensions}
  },
  pdfFile { asset->{ url } },
  media
}`;

export const aboutQuery = `*[_type == "about"][0] {
  title,
  bio,
  email,
  socialLinks
}`;

export const projectSlugsQuery = `*[_type == "project" && defined(slug.current)] {
  "slug": slug.current
}`;

export interface SiteSettings {
  logoUrl?: string;
  heroBackgroundType?: "video" | "organic" | "none";
  showreelVideoUrl?: string;
  heroVideoBlur?: number;
  heroBottomFade?: number;
}

export const siteSettingsQuery = `*[_type == "siteSettings"] | order(_updatedAt desc)[0] {
  "logoUrl": logo.asset->url,
  heroBackgroundType,
  heroVideoBlur,
  heroBottomFade,
  "showreelVideoUrl": coalesce(
    showreelVideoUrl,
    showreelVideoFile.asset->url
  )
}`;

export type ProjectWithDisplay = SanityProject & { displayTitle: string };
