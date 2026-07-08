const preloaded = new Set<string>();

export function preloadVideo(src: string, mode: "metadata" | "auto" = "metadata"): void {
  if (!src || typeof window === "undefined" || preloaded.has(src)) return;

  preloaded.add(src);

  const video = document.createElement("video");
  video.preload = mode;
  video.muted = true;
  video.playsInline = true;
  video.src = src;
  video.load();
}

export function preloadVideosIdle(
  sources: string[],
  mode: "metadata" | "auto" = "metadata",
): () => void {
  let cancelled = false;
  let cursor = 0;

  const schedule = (fn: () => void) => {
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(fn, { timeout: 3000 });
      return;
    }
    setTimeout(fn, 120);
  };

  const loadNext = () => {
    if (cancelled || cursor >= sources.length) return;
    preloadVideo(sources[cursor++], mode);
    schedule(loadNext);
  };

  schedule(loadNext);

  return () => {
    cancelled = true;
  };
}
