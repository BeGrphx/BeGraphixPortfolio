import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/FadeIn";
import { ProjectPageBlocks } from "@/components/ProjectPageBlocks";
import type { Locale } from "@/i18n/routing";
import { getLocalizedAuto } from "@/lib/i18n";
import { localizeProjectDetail } from "@/lib/localize-project";
import { formatProjectDate } from "@/lib/media";
import {
  getHomeProjectsHref,
  projectTypeToHomeFilter,
} from "@/lib/home-navigation";
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

  const title = await getLocalizedAuto(project.title, locale);
  const description = await getLocalizedAuto(project.description, locale);
  const ogImage = project.thumbnail
    ? urlFor(project.thumbnail).width(1200).height(630).url()
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(ogImage
        ? { images: [{ url: ogImage, width: 1200, height: 630, alt: title }] }
        : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
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
  const projectRaw = await getProject(slug);
  if (!projectRaw) notFound();

  const project = await localizeProjectDetail(projectRaw, locale);
  const { title } = project;
  const accent = project.dominantColor ?? "#1a1a1a";
  const homeHref = getHomeProjectsHref(
    projectTypeToHomeFilter(projectRaw.projectType),
  );

  return (
    <div
      className="min-h-screen pb-[calc(5rem+env(safe-area-inset-bottom))] pt-[calc(6.5rem+env(safe-area-inset-top))] sm:pt-32 md:pt-40"
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

      <div className="mx-auto max-w-[1400px] px-3 sm:px-4 md:px-8">
        <FadeIn>
          <header className="mb-8 px-1 text-center sm:mb-12 sm:px-2 md:mb-16">
            <h1 className="font-display text-[clamp(1.75rem,6.5vw,3.75rem)] font-medium leading-tight tracking-tight">
              {title}
            </h1>
            <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-muted sm:mt-4 sm:text-xs sm:tracking-[0.25em]">
              {[project.client, project.completedAt && formatProjectDate(project.completedAt), project.duration]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {project.tags && project.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-1.5 sm:mt-6 sm:gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-neutral-300 px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted dark:border-neutral-800 sm:px-3 sm:text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>
        </FadeIn>

        <ProjectPageBlocks
          project={project}
          downloadPdfLabel={t("downloadPdf")}
        />

        <FadeIn delay={0.2}>
          <div className="mt-16 flex justify-center px-4 sm:mt-20">
            <Link
              href={homeHref}
              scroll={false}
              className="inline-flex min-h-12 w-full max-w-xs items-center justify-center bg-foreground px-10 py-3.5 text-xs font-medium uppercase tracking-[0.22em] text-background transition-opacity hover:opacity-85 active:opacity-75 sm:w-auto sm:max-w-none sm:tracking-[0.25em]"
            >
              {t("home")}
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
