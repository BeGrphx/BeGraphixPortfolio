"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { parseMediaUrl, type ParsedMedia } from "@/lib/media";
import { preloadVideo } from "@/lib/preload-video";
import type { SanityMediaItem } from "@/lib/sanity/queries";
import { FadeIn } from "./FadeIn";
import { VideoPlayer } from "./VideoPlayer";

const MuxPlayer = dynamic(
  () => import("@mux/mux-player-react").then((m) => m.default),
  { ssr: false },
);

interface MediaBlockProps {
  item: SanityMediaItem;
  index: number;
}

const defaultLabels: Record<string, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  link: "En savoir plus",
};

function FileMediaBlock({
  item,
  index,
}: {
  item: SanityMediaItem;
  index: number;
}) {
  useEffect(() => {
    if (item.videoUrl) preloadVideo(item.videoUrl, "auto");
  }, [item.videoUrl]);

  if (!item.videoUrl) {
    return (
      <FadeIn delay={index * 0.08}>
        <div className="flex aspect-video items-center justify-center bg-neutral-900 text-sm text-neutral-500">
          Vidéo manquante
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn delay={index * 0.08}>
      <VideoPlayer
        src={item.videoUrl}
        poster={item.posterUrl}
        title={item.title}
        preload="auto"
        className="w-full rounded-sm"
      />
    </FadeIn>
  );
}

function InstagramMediaBlock({
  item,
  index,
  parsed,
}: {
  item: SanityMediaItem;
  index: number;
  parsed: ParsedMedia;
}) {
  const isReel = parsed.href.includes("/reel/");
  const embedSrc = `${parsed.embedUrl}${parsed.embedUrl?.includes("?") ? "&" : "?"}hidecaption=1&muted=1`;

  return (
    <FadeIn delay={index * 0.08}>
      <div className="bg-neutral-950">
        {item.title && (
          <p className="mb-3 text-center text-xs uppercase tracking-[0.2em] text-neutral-500">
            {item.title}
          </p>
        )}

        <div
          className={`relative mx-auto w-full overflow-hidden bg-black ${
            isReel
              ? "aspect-[9/16] max-w-[400px]"
              : "aspect-video max-w-[720px]"
          }`}
        >
          <iframe
            src={embedSrc}
            title={item.title ?? "Instagram"}
            className="pointer-events-none absolute left-0 top-0 w-full border-0"
            style={{ height: "calc(100% + 72px)" }}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-neutral-950 via-neutral-950/95 to-transparent" />
        </div>
      </div>
    </FadeIn>
  );
}

export function MediaBlock({ item, index }: MediaBlockProps) {
  const [muted, setMuted] = useState(true);

  if (item.mediaType === "file") {
    return <FileMediaBlock item={item} index={index} />;
  }

  if (item.mediaType === "mux" && item.muxPlaybackId) {
    return (
      <FadeIn delay={index * 0.08}>
        <div className="overflow-hidden rounded-sm bg-neutral-950">
          {item.title && (
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
              {item.title}
            </p>
          )}
          <div className="relative aspect-video w-full overflow-hidden">
            <MuxPlayer
              playbackId={item.muxPlaybackId}
              muted={muted}
              streamType="on-demand"
              className="h-full w-full"
            />
          </div>
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-300"
            >
              {muted ? "🔇 Activer le son" : "🔊 Couper le son"}
            </button>
          </div>
        </div>
      </FadeIn>
    );
  }

  const parsed = item.url
    ? parseMediaUrl(item.url, item.mediaType as Parameters<typeof parseMediaUrl>[1])
    : null;

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

  if (isInstagram) {
    return <InstagramMediaBlock item={item} index={index} parsed={parsed} />;
  }

  return (
    <FadeIn delay={index * 0.08}>
      <div className="overflow-hidden bg-neutral-950">
        {item.title && (
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
            {item.title}
          </p>
        )}
        <div
          className="relative w-full overflow-hidden aspect-video"
        >
          <iframe
            src={`${parsed.embedUrl}${parsed.embedUrl.includes("?") ? "&" : "?"}muted=1`}
            title={item.title ?? "Média embarqué"}
            className="absolute inset-0 h-full w-full border-0"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
          />
        </div>
      </div>
    </FadeIn>
  );
}
