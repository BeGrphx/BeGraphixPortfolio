import { getTranslations, setRequestLocale } from "next-intl/server";
import { FadeIn } from "@/components/FadeIn";
import { PresentationMode } from "@/components/PresentationMode";
import { ProjectGrid } from "@/components/ProjectGrid";
import { WebGLHero } from "@/components/WebGLHero";
import type { Locale } from "@/i18n/routing";
import { client } from "@/lib/sanity/client";
import { projectsQuery, type SanityProject } from "@/lib/sanity/queries";

export const revalidate = 60;

async function getProjects(): Promise<SanityProject[]> {
  try {
    return await client.fetch(projectsQuery);
  } catch {
    return [];
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const projects = await getProjects();

  return (
    <>
      <PresentationMode projects={projects} locale={locale} />
      <div className="relative min-h-screen px-6 pb-24 pt-32 md:px-10 md:pt-40">
        <WebGLHero />
        <div className="mx-auto max-w-7xl">
          <FadeIn>
            <div className="mb-16 max-w-2xl md:mb-24">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted">
                {t("eyebrow")}
              </p>
              <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
                {t("titleLine1")}
                <br />
                <span className="text-muted">{t("titleLine2")}</span>
              </h1>
            </div>
          </FadeIn>
          <ProjectGrid projects={projects} locale={locale} />
        </div>
      </div>
    </>
  );
}
