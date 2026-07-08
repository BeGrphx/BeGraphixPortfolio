"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
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
  className?: string;
}

export function VideoPlayer({
  src,
  poster,
  title,
  preload = "auto",
  className = "",
}: VideoPlayerProps) {
  const labelId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const revealControls = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    }, 2800);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
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

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    revealControls();
  }, [revealControls]);

  const toggleFullscreen = useCallback(() => {
    const container = videoRef.current?.parentElement;
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

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferProgress = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      className={`group/player relative overflow-hidden bg-neutral-950 ${className}`}
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
        className="aspect-video h-full w-full bg-black object-contain"
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
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />

      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30 transition-opacity duration-300 ${
          showControls || !playing ? "opacity-100" : "opacity-0"
        }`}
      />

      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-sm transition-transform hover:scale-105"
          aria-label="Lire la vidéo"
        >
          <span className="ml-1 text-xl leading-none">▶</span>
        </button>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 z-20 px-4 pb-4 pt-10 transition-opacity duration-300 ${
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

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="text-xs uppercase tracking-[0.15em] text-white/80 transition-colors hover:text-white"
              aria-label={playing ? "Pause" : "Lecture"}
            >
              {playing ? "Pause" : "Lecture"}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="text-xs uppercase tracking-[0.15em] text-white/60 transition-colors hover:text-white"
              aria-label={muted ? "Activer le son" : "Couper le son"}
            >
              {muted ? "Muet" : "Son"}
            </button>
          </div>

          <p className="font-mono text-[11px] text-white/50">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="text-xs uppercase tracking-[0.15em] text-white/60 transition-colors hover:text-white"
            aria-label={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {isFullscreen ? "Réduire" : "Plein écran"}
          </button>
        </div>
      </div>
    </div>
  );
}
