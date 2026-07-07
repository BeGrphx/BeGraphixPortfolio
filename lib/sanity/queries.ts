export interface SanityVideo {
  title?: string;
  vimeoUrl: string;
}

export interface SanityProject {
  _id: string;
  title: string;
  slug: { current: string };
  client?: string;
  year?: number;
  description?: string;
  tags?: string[];
  thumbnail: {
    asset: { _ref: string };
    alt?: string;
  };
  videos?: SanityVideo[];
  order?: number;
}

export interface SanityAbout {
  title?: string;
  bio?: string;
  email?: string;
  socialLinks?: { label: string; url: string }[];
}

export const projectsQuery = `*[_type == "project"] | order(order asc, year desc) {
  _id,
  title,
  slug,
  client,
  year,
  description,
  tags,
  thumbnail,
  order
}`;

export const projectBySlugQuery = `*[_type == "project" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  client,
  year,
  description,
  tags,
  thumbnail,
  videos,
  order
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
