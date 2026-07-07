"use client";

import { useEffect, useRef } from "react";
import { useSiteLoader } from "@/components/providers/SiteLoaderProvider";

interface VideoBackgroundProps {
  url: string;
  blur: number;
  onError: () => void;
}

export function VideoBackground({ url, blur, onError }: VideoBackgroundProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const onErrorRef = useRef(onError);
  const { contentReady } = useSiteLoader();
  onErrorRef.current = onError;

  useEffect(() => {
    if (!contentReady) return;

    const video = ref.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const tryPlay = () => {
      void video.play().catch(() => {
        /* autoplay policy — not a load failure */
      });
    };

    const handleError = () => onErrorRef.current();

    video.addEventListener("canplay", tryPlay);
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("error", handleError);

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      tryPlay();
    } else {
      video.load();
    }

    return () => {
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("error", handleError);
    };
  }, [url, contentReady]);

  const scale = blur > 0 ? 1.12 + blur / 60 : 1.05;

  return (
    <div className="absolute inset-0 overflow-hidden bg-neutral-950">
      <div className="absolute -inset-[12%]">
        <video
          ref={ref}
          key={url}
          src={url}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
          style={{
            filter: blur > 0 ? `blur(${blur}px)` : undefined,
            transform: `scale(${scale})`,
          }}
        />
      </div>
      <div className="absolute inset-0 bg-black/55" />
    </div>
  );
}
