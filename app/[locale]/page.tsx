import { getTranslations, setRequestLocale } from "next-intl/server";
import { FadeIn } from "@/components/FadeIn";
import { HeroBackground } from "@/components/HeroBackground";
import { HeroDivider } from "@/components/HeroDivider";
import { ProjectGrid } from "@/components/ProjectGrid";
import type { Locale } from "@/i18n/routing";
import { localizeProjects } from "@/lib/localize-project";
import { client } from "@/lib/sanity/client";
import { projectsQuery, type SanityProject } from "@/lib/sanity/queries";
import {
  getSiteSettings,
  resolveShowreelUrl,
} from "@/lib/site-settings";

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

  return (
    <div className="relative">
      <section className="relative min-h-[85vh] overflow-hidden">
        <HeroBackground type={heroType} videoUrl={videoUrl} />
        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-32 md:px-10 md:pt-40">
          <FadeIn>
            <div className="max-w-2xl">
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
        </div>
        <HeroDivider />
      </section>

      <section className="relative bg-background px-6 pb-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <ProjectGrid projects={projects} locale={locale} />
        </div>
      </section>
    </div>
  );
}
