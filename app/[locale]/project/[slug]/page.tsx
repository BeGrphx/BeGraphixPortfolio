import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/FadeIn";
import { MediaBlock } from "@/components/MediaBlock";
import { PhotoGallery } from "@/components/PhotoGallery";
import type { Locale } from "@/i18n/routing";
import { getLocalized } from "@/lib/i18n";
import { formatProjectDate } from "@/lib/media";
import { client } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import {
  projectBySlugQuery,
  projectSlugsQuery,
  type SanityProject,
} from "@/lib/sanity/queries";

export const revalidate = 60;

async function getProject(slug: string): Promise<SanityProject | null> {
  try {
    return await client.fetch(projectBySlugQuery, { slug });
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const slugs: { slug: string }[] = await client.fetch(projectSlugsQuery);
    return routingLocales.flatMap((locale) =>
      slugs.map(({ slug }) => ({ locale, slug })),
    );
  } catch {
    return [];
  }
}

const routingLocales = ["fr", "en", "es"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project" };

  const title = getLocalized(project.title, locale);
  const description = getLocalized(project.description, locale);
  const ogImage = urlFor(project.thumbnail).width(1200).height(630).url();

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("project");
  const project = await getProject(slug);
  if (!project) notFound();

  const title = getLocalized(project.title, locale);
  const description = getLocalized(project.description, locale);
  const credits = getLocalized(project.credits, locale);
  const accent = project.dominantColor ?? "#1a1a1a";

  return (
    <div
      className="min-h-screen pb-24 pt-32 md:pt-40"
      style={
        {
          "--project-accent": accent,
        } as React.CSSProperties
      }
    >
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.07]"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${accent} 0%, transparent 60%)`,
        }}
      />

      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <FadeIn>
          <header className="mb-12 px-2 text-center md:mb-16">
            <h1 className="font-display text-3xl font-medium leading-tight tracking-tight md:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-4 text-xs uppercase tracking-[0.25em] text-muted">
              {[project.client, project.completedAt && formatProjectDate(project.completedAt), project.duration]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {project.tags && project.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-neutral-300 px-3 py-1 text-xs uppercase tracking-wider text-muted dark:border-neutral-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>
        </FadeIn>

        {project.gallery && project.gallery.length > 0 && (
          <PhotoGallery images={project.gallery} />
        )}

        {description && (
          <FadeIn delay={0.1}>
            <p className="mx-auto mb-10 max-w-2xl px-4 text-center text-base leading-relaxed md:text-lg">
              {description}
            </p>
          </FadeIn>
        )}

        {credits && (
          <FadeIn delay={0.12}>
            <p className="font-mono mx-auto mb-16 max-w-xl px-4 text-center text-[11px] leading-relaxed text-muted">
              {credits}
            </p>
          </FadeIn>
        )}

        {project.pdfFile?.asset?.url && (
          <FadeIn delay={0.14}>
            <div className="mb-16 flex justify-center">
              <a
                href={project.pdfFile.asset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-neutral-400 px-8 py-3 text-xs uppercase tracking-[0.2em] transition-opacity hover:opacity-60 dark:border-neutral-700"
              >
                {t("downloadPdf")} ↓
              </a>
            </div>
          </FadeIn>
        )}

        {project.media && project.media.length > 0 && (
          <div className="mx-auto max-w-5xl space-y-12 border-t border-neutral-200 px-4 pt-12 dark:border-neutral-900">
            {project.media.map((item, index) => (
              <MediaBlock key={item._key} item={item} index={index} />
            ))}
          </div>
        )}

        <FadeIn delay={0.2}>
          <div className="mt-20 flex justify-center border-t border-neutral-200 px-4 pt-12 dark:border-neutral-900">
            <Link
              href="/"
              className="inline-block border border-neutral-400 px-10 py-3 text-xs uppercase tracking-[0.25em] text-muted transition-colors hover:border-neutral-600 hover:text-foreground dark:border-neutral-700"
            >
              {t("home")}
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
