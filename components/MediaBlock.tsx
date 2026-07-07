import { parseMediaUrl } from "@/lib/media";
import type { SanityMediaItem } from "@/lib/sanity/queries";
import { FadeIn } from "./FadeIn";

interface MediaBlockProps {
  item: SanityMediaItem;
  index: number;
}

const defaultLabels: Record<string, string> = {
  instagram: "Voir sur Instagram",
  linkedin: "Voir sur LinkedIn",
  link: "En savoir plus",
};

export function MediaBlock({ item, index }: MediaBlockProps) {
  const parsed = parseMediaUrl(item.url, item.mediaType);

  if (!parsed) {
    return (
      <FadeIn delay={index * 0.08}>
        <div className="flex aspect-video items-center justify-center bg-neutral-900 text-sm text-neutral-500">
          URL invalide
        </div>
      </FadeIn>
    );
  }

  if (parsed.kind === "link" || !parsed.embedUrl) {
    const label =
      item.label ?? defaultLabels[item.mediaType] ?? "Ouvrir le lien";

    return (
      <FadeIn delay={index * 0.08}>
        <div className="flex flex-col items-center gap-4 py-4">
          {item.title && (
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              {item.title}
            </p>
          )}
          <a
            href={parsed.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-foreground px-8 py-3 text-xs uppercase tracking-[0.2em] text-background transition-opacity hover:opacity-80"
          >
            {label} →
          </a>
        </div>
      </FadeIn>
    );
  }

  const isInstagram = parsed.aspectRatio === "instagram";

  return (
    <FadeIn delay={index * 0.08}>
      <div className="overflow-hidden bg-neutral-950">
        {item.title && (
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
            {item.title}
          </p>
        )}
        <div
          className={`relative w-full overflow-hidden ${
            isInstagram ? "mx-auto max-w-[540px] aspect-[4/5]" : "aspect-video"
          }`}
        >
          <iframe
            src={parsed.embedUrl}
            title={item.title ?? "Média embarqué"}
            className="absolute inset-0 h-full w-full border-0"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
          />
        </div>
        {item.label && (
          <div className="mt-4 flex justify-center">
            <a
              href={parsed.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-neutral-300"
            >
              {item.label} →
            </a>
          </div>
        )}
      </div>
    </FadeIn>
  );
}
