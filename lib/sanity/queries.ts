import type { MediaType } from "@/lib/media";

export interface SanityGalleryImage {
  asset: { _ref: string };
  alt?: string;
  caption?: string;
}

export interface SanityMediaItem {
  _key: string;
  mediaType: MediaType;
  url: string;
  title?: string;
  label?: string;
}

export type ProjectType = "professional" | "personal";

export interface SanityProject {
  _id: string;
  title: string;
  slug: { current: string };
  projectType?: ProjectType;
  client?: string;
  completedAt?: string;
  description?: string;
  credits?: string;
  tags?: string[];
  thumbnail: SanityGalleryImage;
  gallery?: SanityGalleryImage[];
  media?: SanityMediaItem[];
}

export interface SanityAbout {
  title?: string;
  bio?: string;
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
  description,
  tags,
  thumbnail
}`;

export const projectBySlugQuery = `*[_type == "project" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  projectType,
  client,
  completedAt,
  description,
  credits,
  tags,
  thumbnail,
  gallery,
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
