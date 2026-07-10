import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FadeIn } from "@/components/FadeIn";
import { HomeIntro } from "@/components/HomeIntro";
import type { Locale } from "@/i18n/routing";
import { client } from "@/lib/sanity/client";
import { aboutQuery, type SanityAbout } from "@/lib/sanity/queries";
import { getSiteSettings, resolveLogoUrl } from "@/lib/site-settings";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title") };
}

async function getAboutContact(): Promise<SanityAbout | null> {
  try {
    return await client.fetch(aboutQuery);
  } catch {
    return null;
  }
}

interface ExpertiseCategory {
  title: string;
  items: string[];
}

interface AddedValueItem {
  label: string;
  description: string;
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const [aboutContact, settings] = await Promise.all([
    getAboutContact(),
    getSiteSettings(),
  ]);
  const logoUrl = resolveLogoUrl(settings);
  const backgroundItems = t.raw("backgroundItems") as string[];
  const expertiseCategories = t.raw("expertiseCategories") as ExpertiseCategory[];
  const agencyItems = t.raw("agencyItems") as string[];
  const addedValueItems = t.raw("addedValueItems") as AddedValueItem[];

  return (
    <div className="min-h-screen px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-[calc(6.5rem+env(safe-area-inset-top))] sm:px-6 md:px-10 md:pb-24 md:pt-40">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-start md:gap-14 lg:gap-20">
        {logoUrl && (
          <FadeIn className="w-full md:sticky md:top-32 md:self-start">
            <div className="relative aspect-square w-full overflow-hidden">
              <Image
                src={logoUrl}
                alt="Be Graphi'x"
                fill
                className="object-contain object-center scale-[1.3] sm:scale-[1.4] md:scale-[1.45]"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </FadeIn>
        )}

        <div className="min-w-0">
          <FadeIn>
            <h1 className="font-display text-[clamp(2rem,7vw,3rem)] font-medium tracking-tight">
              {t("title")}
            </h1>
          </FadeIn>

          <FadeIn delay={0.05}>
            <p className="mt-8 text-base leading-relaxed text-neutral-400 sm:mt-10 sm:text-lg">
              {t("intro")}
            </p>
          </FadeIn>

          <HomeIntro showIntro={false} className="mt-12 sm:mt-16" />

          <FadeIn delay={0.15}>
            <section className="mt-14 sm:mt-20">
              <h2 className="text-xs uppercase tracking-[0.3em] text-muted">
                {t("backgroundHeading")}
              </h2>
              <ul className="mt-6 space-y-4 text-base leading-relaxed text-neutral-400 sm:text-lg">
                {backgroundItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-neutral-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </FadeIn>

          <FadeIn delay={0.2}>
            <section className="mt-14 sm:mt-20">
              <h2 className="text-xs uppercase tracking-[0.3em] text-muted">
                {t("expertiseHeading")}
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {expertiseCategories.map((category) => (
                  <div
                    key={category.title}
                    className="rounded-sm border border-neutral-800 p-5 sm:p-6"
                  >
                    <h3 className="font-display text-base font-medium text-foreground sm:text-lg">
                      {category.title}
                    </h3>
                    <ul className="mt-4 space-y-2">
                      {category.items.map((item) => (
                        <li
                          key={item}
                          className="text-sm leading-relaxed text-neutral-400"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <FadeIn delay={0.25}>
            <section className="mt-14 sm:mt-20">
              <h2 className="text-xs uppercase tracking-[0.3em] text-muted">
                {t("agencyHeading")}
              </h2>
              <ul className="mt-6 space-y-3 text-base leading-relaxed text-neutral-400 sm:text-lg">
                {agencyItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-neutral-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </FadeIn>

          <FadeIn delay={0.3}>
            <section className="mt-14 sm:mt-20">
              <h2 className="text-xs uppercase tracking-[0.3em] text-muted">
                {t("addedValueHeading")}
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {addedValueItems.map((item) => (
                  <div key={item.label}>
                    <h3 className="font-display text-base font-medium text-foreground">
                      {item.label}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-400 sm:text-base">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <FadeIn delay={0.35}>
            <section className="mt-14 space-y-6 border-t border-neutral-800 pt-14 sm:mt-20 sm:pt-20">
              <p className="text-base leading-relaxed text-neutral-400 sm:text-lg">
                {t("closing")}
              </p>
              <p className="font-display text-lg font-medium leading-snug text-foreground sm:text-xl">
                {t("tagline")}
              </p>
            </section>
          </FadeIn>

          {(aboutContact?.email ||
            (aboutContact?.socialLinks &&
              aboutContact.socialLinks.length > 0)) && (
            <FadeIn delay={0.4}>
              <section className="mt-14 border-t border-neutral-800 pt-10 sm:mt-20">
                <h2 className="text-xs uppercase tracking-[0.3em] text-muted">
                  {t("contact")}
                </h2>
                <div className="mt-6 space-y-6">
                  {aboutContact.email && (
                    <p>
                      <a
                        href={`mailto:${aboutContact.email}`}
                        className="text-base text-foreground transition-opacity hover:opacity-60 sm:text-lg"
                      >
                        {aboutContact.email}
                      </a>
                    </p>
                  )}
                  {aboutContact.socialLinks &&
                    aboutContact.socialLinks.length > 0 && (
                      <ul className="flex flex-wrap gap-6">
                        {aboutContact.socialLinks.map((link) => (
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
              </section>
            </FadeIn>
          )}
        </div>
      </div>
    </div>
  );
}
