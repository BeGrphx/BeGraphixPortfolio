import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FadeIn } from "@/components/FadeIn";
import type { Locale } from "@/i18n/routing";
import { client } from "@/lib/sanity/client";
import { aboutQuery, type SanityAbout } from "@/lib/sanity/queries";
import { getLocalizedAuto } from "@/lib/i18n";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("defaultTitle") };
}

async function getAbout(): Promise<SanityAbout | null> {
  try {
    return await client.fetch(aboutQuery);
  } catch {
    return null;
  }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const about = await getAbout();
  const aboutTitle = about
    ? await getLocalizedAuto(about.title, locale)
    : "";
  const aboutBio = about ? await getLocalizedAuto(about.bio, locale) : "";

  return (
    <div className="min-h-screen px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-[calc(6.5rem+env(safe-area-inset-top))] sm:px-6 md:px-10 md:pb-24 md:pt-40">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted">
            {t("contact")}
          </p>
          <h1 className="font-display text-[clamp(2rem,7vw,3rem)] font-medium tracking-tight">
            {aboutTitle || t("defaultTitle")}
          </h1>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="mt-8 space-y-6 text-base leading-relaxed text-neutral-500 dark:text-neutral-400 sm:mt-12 sm:space-y-8 sm:text-lg">
            {aboutBio ? (
              <p className="whitespace-pre-line">{aboutBio}</p>
            ) : (
              <p>
                {t("placeholder")}{" "}
                <a href="/studio" className="underline hover:text-foreground">
                  Sanity Studio
                </a>
              </p>
            )}
            {about?.email && (
              <p>
                <a
                  href={`mailto:${about.email}`}
                  className="text-foreground transition-opacity hover:opacity-60"
                >
                  {about.email}
                </a>
              </p>
            )}
            {about?.socialLinks && about.socialLinks.length > 0 && (
              <ul className="flex flex-wrap gap-6 pt-4">
                {about.socialLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
