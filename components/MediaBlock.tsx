"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { parseMediaUrl } from "@/lib/media";
import type { SanityMediaItem } from "@/lib/sanity/queries";
import { FadeIn } from "./FadeIn";

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

export function MediaBlock({ item, index }: MediaBlockProps) {
  const [muted, setMuted] = useState(true);

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
