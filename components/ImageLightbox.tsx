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

  const close = useCallback(() => setOpen(false), []);
  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);
  const next = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

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
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-6 top-6 z-10 text-xs uppercase tracking-[0.2em] text-white/60 hover:text-white"
            >
              Fermer ✕
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 px-4 py-3 text-2xl text-white/70 hover:text-white md:left-8"
                  aria-label="Image précédente"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-4 top-1/2 z-10 -translate-y-1/2 px-4 py-3 text-2xl text-white/70 hover:text-white md:right-8"
                  aria-label="Image suivante"
                >
                  →
                </button>
              </>
            )}

            <div className="relative h-[70vh] w-[90vw] max-w-6xl">
              <Image
                src={images[index].src}
                alt={images[index].alt}
                fill
                className="object-contain"
                priority
                sizes="90vw"
              />
            </div>

            {images[index].caption && (
              <p className="absolute bottom-8 left-1/2 max-w-xl -translate-x-1/2 text-center text-sm text-white/60">
                {images[index].caption}
              </p>
            )}

            {images.length > 1 && (
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/40">
                {index + 1} / {images.length}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
