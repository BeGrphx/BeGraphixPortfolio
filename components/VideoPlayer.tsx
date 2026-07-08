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
} from "react";

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
  preload = "auto",
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
    setIntrinsicSize(null);
  }, [src]);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
      setShowControls(true);
    }
    revealControls();
  }, [revealControls]);

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
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void container.requestFullscreen();
    }
    revealControls();
  }, [revealControls]);

  const seek = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const video = videoRef.current;
      if (!video || !duration) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const ratio = Math.min(
        1,
        Math.max(0, (event.clientX - rect.left) / rect.width),
      );
      video.currentTime = ratio * duration;
      setCurrentTime(video.currentTime);
      revealControls();
    },
    [duration, revealControls],
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
    "group/player relative overflow-hidden bg-black",
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

  const videoClassName = isFullscreen && isAdaptive
    ? "begraphix-video max-h-[100vh] max-w-[100vw] h-auto w-auto object-contain"
    : fit === "cover"
      ? "begraphix-video absolute inset-0 h-full w-full object-cover"
      : isAdaptive && intrinsicSize
        ? "begraphix-video absolute inset-0 h-full w-full object-cover"
        : "begraphix-video block h-auto max-h-[80vh] w-full object-contain";

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      style={containerStyle}
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setShowControls(false)}
      aria-labelledby={title ? labelId : undefined}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload={preload}
        playsInline
        controls={false}
        disablePictureInPicture
        className={videoClassName}
        onClick={togglePlay}
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
        onLoadedMetadata={(e) => handleLoadedMetadata(e.currentTarget)}
      />

      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 transition-opacity duration-300 ${
          showControls || !playing ? "opacity-100" : "opacity-0"
        }`}
      />

      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute left-1/2 top-1/2 z-20 h-[4.5rem] w-[4.5rem] -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 hover:scale-105 active:scale-95"
          aria-label="Lire la vidéo"
        >
          <span className="relative flex h-full w-full items-center justify-center rounded-full border border-white/35 bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/35 via-white/10 to-transparent" />
            <PlayTriangleIcon />
          </span>
        </button>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 z-20 px-4 pb-4 pt-12 transition-opacity duration-300 ${
          showControls || !playing
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        {title && (
          <p
            id={labelId}
            className="mb-3 text-xs uppercase tracking-[0.2em] text-white/70"
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
          className="relative mb-3 h-1 cursor-pointer rounded-full bg-white/15"
          onClick={seek}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white/25"
            style={{ width: `${bufferProgress}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/90 backdrop-blur-md transition-colors hover:bg-white/20"
              aria-label={playing ? "Pause" : "Lecture"}
            >
              {playing ? (
                <span className="text-[10px] font-bold tracking-tighter">II</span>
              ) : (
                <PlayTriangleIcon className="h-3.5 w-3.5" />
              )}
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-[180px]">
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
          </div>

          <p className="font-mono shrink-0 text-[11px] text-white/50">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="shrink-0 text-xs uppercase tracking-[0.15em] text-white/60 transition-colors hover:text-white"
            aria-label={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {isFullscreen ? "Réduire" : "Plein écran"}
          </button>
        </div>
      </div>
    </div>
  );
}
