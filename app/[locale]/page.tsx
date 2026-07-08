import { getTranslations, setRequestLocale } from "next-intl/server";
import { FadeIn } from "@/components/FadeIn";
import { HeroBackground } from "@/components/HeroBackground";
import { ProjectGrid } from "@/components/ProjectGrid";
import type { Locale } from "@/i18n/routing";
import { localizeProjects } from "@/lib/localize-project";
import { client } from "@/lib/sanity/client";
import { projectsQuery, type SanityProject } from "@/lib/sanity/queries";
import {
  getSiteSettings,
  resolveShowreelUrl,
} from "@/lib/site-settings";

export const revalidate = 30;

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
  const projectsTopSpacing = `calc(6vh + ${Math.round(bottomFade * 0.6)}px + 6rem)`;

  return (
    <div className="relative bg-[#080808] text-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 overflow-hidden"
        style={{ height: `calc(78vh + ${Math.round(bottomFade * 0.6)}px)` }}
      >
        <HeroBackground
          type={heroType}
          videoUrl={videoUrl}
          videoBlur={settings?.heroVideoBlur ?? 10}
          bottomFade={bottomFade}
        />
      </div>

      <section className="relative z-10 flex min-h-[72vh] flex-col items-center justify-center px-6 text-center md:px-10">
        <FadeIn className="max-w-4xl">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/70">
            {t("eyebrow")}
          </p>
          <h1 className="font-display text-5xl font-medium leading-[1.02] tracking-tight text-white md:text-7xl lg:text-[5.25rem]">
            {t("titleLine1")}
            <br />
            <span className="text-white">{t("titleLine2")}</span>
          </h1>
          <p className="mx-auto mt-8 max-w-lg text-sm leading-relaxed text-white/80 md:mt-10 md:text-base">
            {t("subtitle")}
          </p>
        </FadeIn>
      </section>

      <section className="relative z-10 px-6 pb-24 md:px-10">
        <div
          className="mx-auto max-w-7xl"
          style={{ paddingTop: projectsTopSpacing }}
        >
          <ProjectGrid projects={projects} locale={locale} />
        </div>
      </section>
    </div>
  );
}
