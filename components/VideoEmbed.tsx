import { getVimeoEmbedUrl } from "@/lib/vimeo";
import { FadeIn } from "./FadeIn";

interface VideoEmbedProps {
  url: string;
  title?: string;
  index: number;
}

export function VideoEmbed({ url, title, index }: VideoEmbedProps) {
  const embedUrl = getVimeoEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className="flex aspect-video items-center justify-center bg-neutral-900 text-sm text-neutral-500">
        URL Vimeo invalide
      </div>
    );
  }

  return (
    <FadeIn delay={index * 0.1}>
      <div className="overflow-hidden bg-neutral-950">
        {title && (
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
            {title}
          </p>
        )}
        <div className="relative aspect-video w-full">
          <iframe
            src={embedUrl}
            title={title ?? "Vidéo Vimeo"}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </FadeIn>
  );
}
