const loaded = new Set<string>();
const inflight = new Map<string, Promise<void>>();

export function isImagePreloaded(src: string): boolean {
  return loaded.has(src);
}

export function preloadImage(src: string): Promise<void> {
  if (!src || loaded.has(src)) return Promise.resolve();

  const existing = inflight.get(src);
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      loaded.add(src);
      inflight.delete(src);
      resolve();
    };
    img.onerror = () => {
      inflight.delete(src);
      reject(new Error(`Failed to preload image`));
    };
    img.src = src;
  });

  inflight.set(src, promise);
  return promise;
}

export function preloadImagesIdle(
  sources: string[],
  onLoaded?: (src: string) => void,
): () => void {
  let cancelled = false;
  let cursor = 0;

  const schedule = (fn: () => void) => {
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(fn, { timeout: 2000 });
      return;
    }
    setTimeout(fn, 80);
  };

  const loadNext = () => {
    if (cancelled || cursor >= sources.length) return;

    const src = sources[cursor++];
    preloadImage(src)
      .then(() => onLoaded?.(src))
      .catch(() => {})
      .finally(() => {
        if (!cancelled) schedule(loadNext);
      });
  };

  schedule(loadNext);

  return () => {
    cancelled = true;
  };
}
