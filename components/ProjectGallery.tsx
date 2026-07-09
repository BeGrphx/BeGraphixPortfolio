"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildImageSrc,
  buildLightboxSrc,
  getImageDimensions,
  isPortrait,
} from "@/lib/sanity/image-utils";
import {
  isImagePreloaded,
  preloadImage,
  preloadImagesIdle,
} from "@/lib/preload-image";
import type { SanityGalleryImage, SanityGalleryItem } from "@/lib/sanity/queries";
import { lockPageScroll, unlockPageScroll } from "@/lib/scroll";
import type { LightboxImage } from "./ImageLightbox";

interface ProjectGalleryProps {
  items: SanityGalleryItem[];
}

function isGalleryImage(item: SanityGalleryItem): item is SanityGalleryImage & {
  _key: string;
  _type: "image";
} {
  return item._type !== "galleryLoopItem" && Boolean(item.asset?._ref);
}

function isGalleryLoop(
  item: SanityGalleryItem,
): item is SanityGalleryItem & { _type: "galleryLoopItem" } {
  return item._type === "galleryLoopItem" || Boolean(item.videoUrl);
}

function getTileLayout(width: number, height: number) {
  const portrait = height > width;

  return {
    portrait,
    className: portrait
      ? "h-[min(58vh,780px)] shrink-0"
      : "w-full md:w-[calc(50%-0.375rem)]",
    style: portrait ? undefined : { aspectRatio: `${width} / ${height}` },
  };
}

function LoopVideoTile({
  videoUrl,
  posterUrl,
}: {
  videoUrl: string;
  posterUrl?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [aspect, setAspect] = useState({ width: 16, height: 10 });

  useEffect(() => {
    setAspect({ width: 16, height: 10 });
  }, [videoUrl]);

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
  }, [videoUrl]);

  const layout = getTileLayout(aspect.width, aspect.height);

  return (
    <article
      className={`relative overflow-hidden bg-neutral-900 ${layout.className}`}
      style={layout.style}
    >
      <video
        ref={ref}
        src={videoUrl}
        poster={posterUrl}
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            setAspect({
              width: video.videoWidth,
              height: video.videoHeight,
            });
          }
        }}
        className={
          layout.portrait
            ? "h-full w-auto max-w-none"
            : "block h-auto w-full"
        }
      />
    </article>
  );
}

export function ProjectGallery({ items }: ProjectGalleryProps) {
  const lenis = useLenis();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [hiResReady, setHiResReady] = useState<Record<string, boolean>>({});

  const imageItems = useMemo(() => items.filter(isGalleryImage), [items]);

  const lightboxImages: LightboxImage[] = useMemo(
    () =>
      imageItems.map((image) => ({
        src: buildImageSrc(image, 1600),
        fullSrc: buildLightboxSrc(image),
        alt: image.alt ?? "",
        caption: image.caption,
        width: image.width,
        height: image.height,
      })),
    [imageItems],
  );

  const hiResSources = useMemo(
    () => lightboxImages.map((image) => image.fullSrc ?? image.src),
    [lightboxImages],
  );

  const markHiResReady = useCallback((src: string) => {
    setHiResReady((prev) => (prev[src] ? prev : { ...prev, [src]: true }));
  }, []);

  useEffect(() => {
    const initialReady = Object.fromEntries(
      hiResSources
        .filter((src) => isImagePreloaded(src))
        .map((src) => [src, true]),
    );
    if (Object.keys(initialReady).length > 0) {
      setHiResReady((prev) => ({ ...prev, ...initialReady }));
    }

    return preloadImagesIdle(hiResSources, markHiResReady);
  }, [hiResSources, markHiResReady]);

  useEffect(() => {
    if (!open) return;

    const neighbors = [
      lightboxImages[(index + 1) % lightboxImages.length],
      lightboxImages[(index - 1 + lightboxImages.length) % lightboxImages.length],
    ];

    neighbors.forEach((image) => {
      const src = image.fullSrc ?? image.src;
      preloadImage(src).then(() => markHiResReady(src)).catch(() => {});
    });
  }, [open, index, lightboxImages, markHiResReady]);

  const close = useCallback(() => setOpen(false), []);
  const prev = useCallback(() => {
    setDirection(-1);
    setIndex((i) => (i - 1 + lightboxImages.length) % lightboxImages.length);
  }, [lightboxImages.length]);
  const next = useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % lightboxImages.length);
  }, [lightboxImages.length]);

  const openImage = useCallback(
    (imageKey: string) => {
      const imageIndex = imageItems.findIndex((item) => item._key === imageKey);
      if (imageIndex < 0) return;

      const image = lightboxImages[imageIndex];
      const src = image.fullSrc ?? image.src;
      preloadImage(src).then(() => markHiResReady(src)).catch(() => {});
      setDirection(0);
      setIndex(imageIndex);
      setOpen(true);
    },
    [imageItems, lightboxImages, markHiResReady],
  );

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir >= 0 ? "12%" : "-12%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir >= 0 ? "-12%" : "12%",
      opacity: 0,
    }),
  };

  useEffect(() => {
    if (!open) return;

    lockPageScroll(lenis);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };

    const blockScroll = (e: Event) => {
      e.preventDefault();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
      unlockPageScroll(lenis);
    };
  }, [open, close, prev, next, lenis]);

  if (!items.length) return null;

  const active = lightboxImages[index];
  const hiResSrc = active?.fullSrc ?? active?.src;
  const showHiRes = hiResSrc
    ? (hiResReady[hiResSrc] ?? isImagePreloaded(hiResSrc))
    : false;
  const { width: activeWidth, height: activeHeight } = getImageDimensions(active);
  const activePortrait = isPortrait(active);

  const imageClassName = `pointer-events-none h-auto max-h-full w-auto max-w-full object-contain transition-opacity duration-300 ${
    activePortrait ? "max-w-[min(96vw,900px)]" : "max-w-[min(96vw,1600px)]"
  }`;

  return (
    <>
      <div className="mb-16 flex flex-wrap items-start justify-center gap-3">
        {items.map((item) => {
          if (isGalleryLoop(item) && item.videoUrl) {
            return (
              <LoopVideoTile
                key={item._key}
                videoUrl={item.videoUrl}
                posterUrl={item.posterUrl}
              />
            );
          }

          if (!isGalleryImage(item)) return null;

          const { width, height } = getImageDimensions(item);
          const portrait = isPortrait(item);
          const layout = getTileLayout(width, height);

          return (
            <button
              key={item._key}
              type="button"
              onClick={() => openImage(item._key)}
              onMouseEnter={() => {
                const src = buildLightboxSrc(item);
                preloadImage(src).then(() => markHiResReady(src)).catch(() => {});
              }}
              onFocus={() => {
                const src = buildLightboxSrc(item);
                preloadImage(src).then(() => markHiResReady(src)).catch(() => {});
              }}
              className={`group relative overflow-hidden bg-neutral-900 text-left ${layout.className}`}
              style={layout.style}
            >
              <Image
                src={buildImageSrc(item, 1600)}
                alt={item.alt ?? ""}
                width={width}
                height={height}
                className={
                  portrait
                    ? "h-full w-auto transition-transform duration-500 group-hover:scale-[1.02]"
                    : "h-auto w-full transition-transform duration-500 group-hover:scale-105"
                }
                sizes={
                  portrait
                    ? "(max-width: 768px) 45vw, 320px"
                    : "(max-width: 768px) 100vw, 50vw"
                }
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {open && active && hiResSrc && (
          <motion.div
            className="fixed inset-0 z-[400] flex touch-none items-center justify-center overscroll-none bg-black/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              className="absolute right-6 top-6 z-20 rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              Fermer ✕
            </button>

            {lightboxImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  className="absolute left-0 top-0 z-20 flex h-full w-20 items-center justify-center text-white/60 transition-colors hover:bg-white/5 hover:text-white md:w-28"
                  aria-label="Image précédente"
                >
                  <span className="text-4xl leading-none">←</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  className="absolute right-0 top-0 z-20 flex h-full w-20 items-center justify-center text-white/60 transition-colors hover:bg-white/5 hover:text-white md:w-28"
                  aria-label="Image suivante"
                >
                  <span className="text-4xl leading-none">→</span>
                </button>
              </>
            )}

            <div
              className="relative z-10 h-[88vh] w-[96vw] max-w-[1600px] px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={hiResSrc}
                  custom={direction}
                  variants={slideVariants}
                  initial={direction === 0 ? false : "enter"}
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Image
                    src={active.src}
                    alt={active.alt}
                    width={activeWidth}
                    height={activeHeight}
                    className={`${imageClassName} ${
                      showHiRes && hiResSrc !== active.src ? "opacity-0" : "opacity-100"
                    }`}
                    sizes="96vw"
                    draggable={false}
                  />
                  {hiResSrc !== active.src && (
                    <Image
                      src={hiResSrc}
                      alt={active.alt}
                      width={activeWidth}
                      height={activeHeight}
                      className={`absolute ${imageClassName} ${
                        showHiRes ? "opacity-100" : "opacity-0"
                      }`}
                      sizes="96vw"
                      draggable={false}
                      unoptimized
                      onLoad={() => markHiResReady(hiResSrc)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              {active.caption && (
                <motion.p
                  key={`caption-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="pointer-events-none absolute bottom-8 left-1/2 z-10 max-w-xl -translate-x-1/2 text-center text-sm text-white/60"
                >
                  {active.caption}
                </motion.p>
              )}
            </AnimatePresence>

            {lightboxImages.length > 1 && (
              <p className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 text-xs text-white/40">
                {index + 1} / {lightboxImages.length}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
