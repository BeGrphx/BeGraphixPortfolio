import type { Metadata } from "next";
import { FadeIn } from "@/components/FadeIn";
import { client } from "@/lib/sanity/client";
import { aboutQuery, type SanityAbout } from "@/lib/sanity/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "À propos",
  description: "Contact et informations — BeGraphix",
};

async function getAbout(): Promise<SanityAbout | null> {
  try {
    return await client.fetch(aboutQuery);
  } catch {
    return null;
  }
}

export default async function AboutPage() {
  const about = await getAbout();

  return (
    <div className="min-h-screen px-6 pb-24 pt-32 md:px-10 md:pt-40">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-neutral-500">
            Contact
          </p>
          <h1 className="mb-12 text-4xl font-medium tracking-tight md:text-5xl">
            {about?.title ?? "À propos"}
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="space-y-8 text-lg leading-relaxed text-neutral-400">
            {about?.bio ? (
              <p className="whitespace-pre-line">{about.bio}</p>
            ) : (
              <p>
                Motion designer et créateur vidéo IA. Ce texte est modifiable
                depuis{" "}
                <a href="/studio" className="underline hover:text-neutral-200">
                  Sanity Studio
                </a>
                .
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
                      className="text-xs uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-neutral-200"
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
