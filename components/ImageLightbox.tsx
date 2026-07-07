"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
}

export function ImageLightbox({ images }: ImageLightboxProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const close = useCallback(() => setOpen(false), []);
  const prev = useCallback(() => {
    setDirection(-1);
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);
  const next = useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "18%" : "-18%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-18%" : "18%",
      opacity: 0,
    }),
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, prev, next]);

  if (!images.length) return null;

  return (
    <>
      <div className="mb-16 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, i) => (
          <button
            key={image.src}
            type="button"
            onClick={() => {
              setDirection(0);
              setIndex(i);
              setOpen(true);
            }}
            className="group relative aspect-[4/3] overflow-hidden bg-neutral-900 text-left"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[400] flex items-center justify-center bg-black/95"
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

            {images.length > 1 && (
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
              className="relative z-10 h-[70vh] w-[90vw] max-w-6xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={images[index].src}
                  custom={direction}
                  variants={slideVariants}
                  initial={direction === 0 ? false : "enter"}
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  drag={images.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.12}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60) next();
                    else if (info.offset.x > 60) prev();
                  }}
                  className="absolute inset-0 cursor-grab active:cursor-grabbing"
                >
                  <Image
                    src={images[index].src}
                    alt={images[index].alt}
                    fill
                    className="pointer-events-none object-contain"
                    priority
                    sizes="90vw"
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              {images[index].caption && (
                <motion.p
                  key={`caption-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="pointer-events-none absolute bottom-8 left-1/2 z-10 max-w-xl -translate-x-1/2 text-center text-sm text-white/60"
                >
                  {images[index].caption}
                </motion.p>
              )}
            </AnimatePresence>

            {images.length > 1 && (
              <p className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 text-xs text-white/40">
                {index + 1} / {images.length}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
