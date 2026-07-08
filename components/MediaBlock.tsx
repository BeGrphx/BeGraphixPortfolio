"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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

function PlayTriangleIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`ml-0.5 fill-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] ${className}`}
      aria-hidden
    >
      <path d="M8 5.14v13.72L19 12 8 5.14z" />
    </svg>
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
  const t = useTranslations("project");
  const [engaged, setEngaged] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [thumbnailReady, setThumbnailReady] = useState(false);
  const isReel = parsed.href.includes("/reel/");
  const embedSrc = `${parsed.embedUrl}${parsed.embedUrl?.includes("?") ? "&" : "?"}hidecaption=1`;

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/instagram-thumbnail?url=${encodeURIComponent(parsed.href)}`)
      .then((response) => response.json())
      .then((data: { thumbnail?: string | null }) => {
        if (!cancelled) {
          setThumbnail(data.thumbnail ?? null);
          setThumbnailReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) setThumbnailReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [parsed.href]);

  const showPoster = !engaged && Boolean(thumbnail);
  const showIframe = engaged || (thumbnailReady && !thumbnail);

  return (
    <FadeIn delay={index * 0.08}>
      <div>
        {item.title && (
          <p className="mb-6 text-center text-xs uppercase tracking-[0.2em] text-neutral-500">
            {item.title}
          </p>
        )}

        <div
          className={`relative mx-auto w-full overflow-hidden bg-neutral-950 ${
            isReel
              ? "aspect-[9/16] max-w-[min(100%,400px)]"
              : "aspect-video max-w-[720px]"
          }`}
        >
          {showIframe && (
            <>
              <iframe
                src={embedSrc}
                title={item.title ?? "Instagram"}
                className="absolute left-1/2 border-0"
                style={{
                  top: isReel ? "-35%" : "-18%",
                  width: isReel ? "118%" : "112%",
                  height: isReel ? "280%" : "190%",
                  transform: "translateX(-50%)",
                }}
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
              />
              <div className="pointer-events-none absolute inset-x-0 top-[42%] z-10 h-[14%] bg-neutral-950" />
            </>
          )}

          {showPoster && (
            <img
              src={thumbnail!}
              alt=""
              className="absolute inset-0 z-[1] h-full w-full object-cover"
            />
          )}

          {!engaged && (
            <button
              type="button"
              onClick={() => setEngaged(true)}
              className="absolute left-1/2 top-1/2 z-20 h-[4.5rem] w-[4.5rem] -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 hover:scale-105 active:scale-95"
              aria-label="Lire la vidéo"
            >
              <span className="relative flex h-full w-full items-center justify-center rounded-full border border-white/35 bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
                <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/35 via-white/10 to-transparent" />
                <PlayTriangleIcon />
              </span>
            </button>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href={parsed.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-foreground px-10 py-3 text-xs uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-80"
          >
            {item.label ?? t("viewMoreInstagram")} →
          </a>
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
        <div className="relative aspect-video w-full overflow-hidden">
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
