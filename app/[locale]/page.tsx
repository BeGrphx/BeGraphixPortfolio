import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Suspense } from "react";
import { FadeIn } from "@/components/FadeIn";
import { HeroBackground } from "@/components/HeroBackground";
import { HomeScrollToProjects } from "@/components/HomeScrollToProjects";
import { ProjectGrid } from "@/components/ProjectGrid";
import type { Locale } from "@/i18n/routing";
import { localizeProjects } from "@/lib/localize-project";
import { client } from "@/lib/sanity/client";
import { projectsQuery, type SanityProject } from "@/lib/sanity/queries";
import {
  getSiteSettings,
  resolveShowreelUrl,
} from "@/lib/site-settings";
import { siteTitle } from "@/lib/metadata";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const pageTitle = `${t("titleLine1")} ${t("titleLine2")}`;

  return {
    title: siteTitle,
    description: t("subtitle"),
    openGraph: {
      title: `BeGraphix — ${pageTitle}`,
      description: t("subtitle"),
      type: "website",
    },
  };
}

async function getProjects(): Promise<SanityProject[]> {
  try {
    return await client.fetch(
      projectsQuery,
      {},
      { next: { revalidate: 30 } },
    );
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

  const [projectsRaw, settings] = await Promise.all([
    getProjects(),
    getSiteSettings(),
  ]);
  const projects = await localizeProjects(projectsRaw, locale);

  const videoUrl = resolveShowreelUrl(settings);
  const rawType = settings?.heroBackgroundType as string | undefined;
  const heroType =
    rawType === "webgl"
      ? "organic"
      : (rawType as "video" | "organic" | "none" | undefined) ??
        (videoUrl ? "video" : "none");

  const bottomFade = settings?.heroBottomFade ?? 320;
  const heroBackgroundHeight = `calc(56vh + ${Math.round(bottomFade * 0.35)}px)`;
  const projectsFadeOffset = `${Math.round(bottomFade * 0.35)}px`;

  return (
    <div className="relative bg-[#080808] text-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 overflow-hidden"
        style={{ height: heroBackgroundHeight }}
      >
        <HeroBackground
          type={heroType}
          videoUrl={videoUrl}
          videoBlur={settings?.heroVideoBlur ?? 10}
          bottomFade={bottomFade}
        />
      </div>

      <section className="relative z-10 flex min-h-[70svh] flex-col items-center justify-center px-4 pb-8 pt-[calc(6.5rem+env(safe-area-inset-top))] text-center sm:px-6 sm:pb-10 sm:pt-28 md:min-h-[54vh] md:px-10 md:pb-12 md:pt-32">
        <FadeIn className="max-w-4xl">
          <p className="mb-4 text-[11px] uppercase tracking-[0.22em] text-white/75 sm:mb-5 sm:text-sm sm:tracking-[0.35em] md:mb-6">
            {t("eyebrow")}
          </p>
          <h1 className="font-display text-[clamp(2.125rem,9vw,5.25rem)] font-medium leading-[1.04] tracking-tight text-white">
            {t("titleLine1")}
            <br />
            <span className="text-white">{t("titleLine2")}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-white/90 sm:mt-7 sm:text-base md:mt-9 md:text-lg md:leading-relaxed">
            {t("subtitle")}
          </p>
        </FadeIn>
      </section>

      <section className="relative z-10 px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:px-6 md:px-10 md:pb-24">
        <Suspense fallback={null}>
          <HomeScrollToProjects />
        </Suspense>
        <div
          className="mx-auto max-w-7xl pt-6 md:pt-[calc(2vh+var(--projects-fade-offset)+1.5rem)]"
          style={
            {
              "--projects-fade-offset": projectsFadeOffset,
            } as React.CSSProperties
          }
        >
          <div id="projects" className="scroll-mt-[calc(5.5rem+env(safe-area-inset-top))]">
            <Suspense fallback={null}>
              <ProjectGrid projects={projects} locale={locale} />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
