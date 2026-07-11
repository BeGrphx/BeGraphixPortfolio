"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

const PREVIEW_START_SECONDS = 0.02;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  preload?: "none" | "metadata" | "auto";
  fit?: "auto" | "cover" | "contain";
  className?: string;
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

export function VideoPlayer({
  src,
  poster,
  title,
  preload = "metadata",
  fit = "auto",
  className = "",
}: VideoPlayerProps) {
  const labelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastVolume = useRef(0.85);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [intrinsicSize, setIntrinsicSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const isAdaptive = fit === "auto" || fit === "contain";
  const isPortrait = intrinsicSize
    ? intrinsicSize.width < intrinsicSize.height
    : false;

  const revealControls = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    }, 2800);
  }, []);

  const applyVolume = useCallback((value: number) => {
    const video = videoRef.current;
    if (!video) return;

    const clamped = Math.min(1, Math.max(0, value));
    video.volume = clamped;
    video.muted = clamped === 0;
    setVolume(clamped);
    if (clamped > 0) lastVolume.current = clamped;
  }, []);

  useEffect(() => {
    applyVolume(0.85);
  }, [applyVolume, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onWebkitBegin = () => setIsFullscreen(true);
    const onWebkitEnd = () => setIsFullscreen(false);
    video.addEventListener("webkitbeginfullscreen", onWebkitBegin);
    video.addEventListener("webkitendfullscreen", onWebkitEnd);

    return () => {
      video.removeEventListener("webkitbeginfullscreen", onWebkitBegin);
      video.removeEventListener("webkitendfullscreen", onWebkitEnd);
    };
  }, [src]);

  useEffect(() => {
    setIntrinsicSize(null);
  }, [src]);

  const primeFirstFrame = useCallback((video: HTMLVideoElement) => {
    if (poster || !video.paused) return;

    const seekToPreview = () => {
      if (video.currentTime >= PREVIEW_START_SECONDS * 0.5) return;
      try {
        video.currentTime = PREVIEW_START_SECONDS;
      } catch {
        // Seek can fail before the browser has buffered enough data.
      }
    };

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      seekToPreview();
      return;
    }

    video.addEventListener("loadedmetadata", seekToPreview, { once: true });
  }, [poster]);

  const effectivePreload = preload;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const prime = () => {
      if (video.preload === "none") {
        video.preload = "metadata";
        video.load();
      }
      if (!poster && video.paused) primeFirstFrame(video);
    };

    if (typeof IntersectionObserver === "undefined") {
      prime();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) prime();
      },
      { rootMargin: "320px 0px", threshold: 0.01 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [poster, primeFirstFrame, src]);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      const container = containerRef.current;
      const active =
        document.fullscreenElement === container ||
        (document as Document & { webkitFullscreenElement?: Element })
          .webkitFullscreenElement === container;
      setIsFullscreen(Boolean(active));
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
    };
  }, []);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        video.muted = volume === 0;
        await video.play();
        setPlaying(true);
      } catch {
        video.muted = true;
        try {
          await video.play();
          setPlaying(true);
        } catch {
          /* autoplay blocked */
        }
      }
    } else {
      video.pause();
      setPlaying(false);
      setShowControls(true);
    }
    revealControls();
  }, [revealControls, volume]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container || document.fullscreenElement !== container) return;

      if (event.code === "Space" || event.key === " ") {
        event.preventDefault();
        togglePlay();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [togglePlay]);

  const toggleMute = useCallback(() => {
    if (volume > 0) {
      applyVolume(0);
      return;
    }
    applyVolume(lastVolume.current || 0.85);
    revealControls();
  }, [applyVolume, revealControls, volume]);

  const onVolumeChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      applyVolume(Number(event.target.value) / 100);
      revealControls();
    },
    [applyVolume, revealControls],
  );

  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const doc = document as Document & {
      webkitFullscreenElement?: Element;
      webkitExitFullscreen?: () => Promise<void>;
    };

    const videoEl = video as HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
      webkitDisplayingFullscreen?: boolean;
    };

    const isActive =
      document.fullscreenElement === container ||
      doc.webkitFullscreenElement === container ||
      videoEl.webkitDisplayingFullscreen;

    if (isActive) {
      if (document.exitFullscreen) {
        void document.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        void doc.webkitExitFullscreen();
      }
      return;
    }

    if (videoEl.webkitEnterFullscreen) {
      videoEl.webkitEnterFullscreen();
      revealControls();
      return;
    }

    const request =
      container.requestFullscreen?.bind(container) ??
      (container as HTMLElement & { webkitRequestFullscreen?: () => void })
        .webkitRequestFullscreen?.bind(container);
    request?.();
    revealControls();
  }, [revealControls]);

  const seekToRatio = useCallback(
    (ratio: number) => {
      const video = videoRef.current;
      if (!video || !duration) return;

      const clamped = Math.min(1, Math.max(0, ratio));
      video.currentTime = clamped * duration;
      setCurrentTime(video.currentTime);
      revealControls();
    },
    [duration, revealControls],
  );

  const seek = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      seekToRatio((event.clientX - rect.left) / rect.width);
    },
    [seekToRatio],
  );

  const seekFromPointer = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      seekToRatio((event.clientX - rect.left) / rect.width);
    },
    [seekToRatio],
  );

  const handleLoadedMetadata = useCallback(
    (video: HTMLVideoElement) => {
      setDuration(video.duration);

      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setIntrinsicSize({
          width: video.videoWidth,
          height: video.videoHeight,
        });
      }
    },
    [],
  );

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferProgress = duration > 0 ? (buffered / duration) * 100 : 0;
  const isMuted = volume === 0;

  let containerStyle: CSSProperties | undefined;
  if (!isFullscreen && isAdaptive && intrinsicSize) {
    const ratio = intrinsicSize.width / intrinsicSize.height;
    containerStyle = isPortrait
      ? {
          aspectRatio: `${intrinsicSize.width} / ${intrinsicSize.height}`,
          width: `min(100%, calc(min(85vh, 920px) * ${ratio}))`,
          maxHeight: "min(85vh, 920px)",
          marginInline: "auto",
        }
      : {
          aspectRatio: `${intrinsicSize.width} / ${intrinsicSize.height}`,
          width: "100%",
          maxHeight: "80vh",
        };
  }

  const containerClassName = [
    "begraphix-video-player group/player relative overflow-hidden bg-black",
    isFullscreen && isAdaptive
      ? "flex h-screen w-screen items-center justify-center"
      : "",
    !isFullscreen && fit === "cover" ? "aspect-video w-full" : "",
    !isFullscreen && isAdaptive && !intrinsicSize ? "aspect-video w-full" : "",
    !isFullscreen && isAdaptive && isPortrait ? "mx-auto" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const isUltrawide = intrinsicSize
    ? intrinsicSize.width / intrinsicSize.height >= 1.85
    : false;

  const videoClassName = isFullscreen && isAdaptive
    ? "begraphix-video max-h-[100vh] max-w-[100vw] h-auto w-auto object-contain"
    : fit === "cover"
      ? "begraphix-video absolute inset-0 h-full w-full object-cover"
      : isAdaptive && intrinsicSize
        ? `begraphix-video absolute inset-0 h-full w-full ${isUltrawide ? "object-contain" : "object-cover"}`
        : "begraphix-video block h-auto max-h-[80vh] w-full object-contain";

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      style={{
        ...containerStyle,
        ...(isFullscreen ? { colorScheme: "dark" as const } : {}),
      }}
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setShowControls(false)}
      onTouchStart={revealControls}
      aria-labelledby={title ? labelId : undefined}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload={effectivePreload}
        muted
        playsInline
        controls={false}
        disablePictureInPicture
        className={videoClassName}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onProgress={(e) => {
          const video = e.currentTarget;
          if (video.buffered.length > 0) {
            setBuffered(video.buffered.end(video.buffered.length - 1));
          }
        }}
        onLoadedMetadata={(e) => {
          handleLoadedMetadata(e.currentTarget);
        }}
      />

      <button
        type="button"
        aria-label={playing ? "Pause" : "Lire la vidéo"}
        className="absolute inset-0 z-10 cursor-pointer border-0 bg-transparent p-0"
        onClick={(event) => {
          event.stopPropagation();
          void togglePlay();
        }}
      />

      {!isFullscreen && (
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 transition-opacity duration-300 ${
            showControls || !playing ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {!playing && (
        <button
          type="button"
          data-video-control
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            void togglePlay();
          }}
          className="absolute left-1/2 top-1/2 z-30 h-11 w-11 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 active:scale-95 sm:h-14 sm:w-14 md:h-[4.5rem] md:w-[4.5rem] md:hover:scale-105"
          aria-label="Lire la vidéo"
        >
          <span
            className={`relative flex h-full w-full items-center justify-center rounded-full border border-white/35 bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_12px_40px_rgba(0,0,0,0.45)] ${
              isFullscreen ? "bg-black/60" : "backdrop-blur-2xl"
            }`}
          >
            {!isFullscreen && (
              <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/35 via-white/10 to-transparent" />
            )}
            <PlayTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
          </span>
        </button>
      )}

      <div
        data-video-control
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-6 transition-opacity duration-300 sm:px-4 sm:pb-4 sm:pt-12 ${
          isFullscreen ? "bg-gradient-to-t from-black via-black/95 to-transparent" : ""
        } ${
          showControls || !playing
            ? "opacity-100"
            : "opacity-0"
        }`}
      >
        {title && (
          <p
            id={labelId}
            className="mb-2 truncate text-[10px] uppercase tracking-[0.16em] text-white/70 sm:mb-3 sm:text-xs sm:tracking-[0.2em]"
          >
            {title}
          </p>
        )}

        <div
          role="slider"
          aria-label="Progression"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          className="pointer-events-auto relative mb-3 h-2 cursor-pointer rounded-full bg-white/15 py-2 sm:h-1 sm:py-0"
          onClick={seek}
          onPointerDown={(event) => {
            seekFromPointer(event);
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
            seekFromPointer(event);
          }}
        >
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/15 sm:top-0 sm:h-full sm:translate-y-0">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-white/25"
              style={{ width: `${bufferProgress}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-white"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:gap-x-4 sm:gap-y-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
            <button
              type="button"
              data-video-control
              onClick={(event) => {
                event.stopPropagation();
                void togglePlay();
              }}
              className={`pointer-events-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/90 transition-colors hover:bg-white/20 sm:h-8 sm:w-8 ${
                isFullscreen ? "" : "backdrop-blur-md"
              }`}
              aria-label={playing ? "Pause" : "Lecture"}
            >
              {playing ? (
                <span className="text-[10px] font-bold tracking-tighter">II</span>
              ) : (
                <PlayTriangleIcon className="h-3.5 w-3.5" />
              )}
            </button>

            <div className="hidden min-w-0 flex-1 items-center gap-2 sm:flex sm:max-w-[180px]">
              <button
                type="button"
                onClick={toggleMute}
                className="shrink-0 text-xs uppercase tracking-[0.15em] text-white/60 transition-colors hover:text-white"
                aria-label={isMuted ? "Activer le son" : "Couper le son"}
              >
                {isMuted ? "Muet" : "Son"}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(volume * 100)}
                onChange={onVolumeChange}
                aria-label="Volume"
                className="h-1 min-w-[72px] flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-white [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
            </div>
            <button
              type="button"
              onClick={toggleMute}
              className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-white/60 transition-colors hover:text-white sm:hidden"
              aria-label={isMuted ? "Activer le son" : "Couper le son"}
            >
              {isMuted ? "Muet" : "Son"}
            </button>
          </div>

          <p className="font-mono shrink-0 text-[10px] text-white/50 sm:text-[11px]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="pointer-events-auto shrink-0 min-h-10 px-1 text-[10px] uppercase tracking-[0.12em] text-white/60 transition-colors hover:text-white sm:min-h-0 sm:text-xs sm:tracking-[0.15em]"
            aria-label={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {isFullscreen ? "Réduire" : "Plein écran"}
          </button>
        </div>
      </div>
    </div>
  );
}
