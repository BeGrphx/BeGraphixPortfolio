"use client";

import { useEffect, useRef, useState } from "react";

interface VideoBackgroundProps {
  url: string;
  blur: number;
  onError: () => void;
}

export function VideoBackground({ url, blur, onError }: VideoBackgroundProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const onErrorRef = useRef(onError);
  const [allowPlayback, setAllowPlayback] = useState(false);
  onErrorRef.current = onError;

  useEffect(() => {
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    setAllowPlayback(!connection?.saveData && !reducedMotion);
  }, []);

  useEffect(() => {
    if (!allowPlayback) return;

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
  }, [allowPlayback, url]);

  const scale = blur > 0 ? 1.04 + blur / 90 : 1;

  return (
    <div className="absolute inset-0 overflow-hidden bg-neutral-950">
      <div className="absolute -inset-[6%]">
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 40%, var(--organic-a) 0%, transparent 48%), radial-gradient(circle at 70% 60%, var(--organic-b) 0%, transparent 45%)",
          }}
        />
        {allowPlayback && (
          <video
            ref={ref}
            key={url}
            src={url}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
            style={{
              filter: blur > 0 ? `blur(${blur}px)` : undefined,
              transform: `scale(${scale})`,
            }}
          />
        )}
      </div>
      <div className="absolute inset-0 bg-black/55" />
    </div>
  );
}
