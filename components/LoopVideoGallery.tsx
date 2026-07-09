"use client";

import { useEffect, useRef } from "react";
import type { SanityLoopVideoItem } from "@/lib/sanity/queries";

interface LoopVideoTileProps {
  video: SanityLoopVideoItem;
}

function LoopVideoTile({ video }: LoopVideoTileProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void element.play().catch(() => {});
          return;
        }
        element.pause();
      },
      { threshold: 0.25 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [video.videoUrl]);

  if (!video.videoUrl) return null;

  return (
    <article className="relative w-full overflow-hidden bg-neutral-900 md:w-[calc(50%-0.375rem)]">
      <div className="relative aspect-[16/10] w-full">
        <video
          ref={ref}
          src={video.videoUrl}
          poster={video.posterUrl}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {video.title && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-5 pb-5 pt-16 text-center md:px-8 md:pb-6">
            <p className="font-display text-lg uppercase tracking-[0.14em] text-white md:text-2xl">
              {video.title}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

interface LoopVideoGalleryProps {
  videos: SanityLoopVideoItem[];
}

export function LoopVideoGallery({ videos }: LoopVideoGalleryProps) {
  if (!videos.length) return null;

  return (
    <div className="mb-16 flex flex-wrap items-start justify-center gap-3">
      {videos.map((video) => (
        <LoopVideoTile key={video._key} video={video} />
      ))}
    </div>
  );
}
