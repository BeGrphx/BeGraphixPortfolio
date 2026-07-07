"use client";

import { useEffect, useRef } from "react";

interface VideoBackgroundProps {
  url: string;
  onError: () => void;
}

export function VideoBackground({ url, onError }: VideoBackgroundProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
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
  }, [url]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-neutral-950">
      <video
        ref={ref}
        key={url}
        src={url}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
      />
      <div className="absolute inset-0 bg-white/60 dark:bg-black/55" />
    </div>
  );
}
