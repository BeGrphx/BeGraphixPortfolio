"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { getLocalized } from "@/lib/i18n";
import type { Locale } from "@/i18n/routing";
import { urlFor } from "@/lib/sanity/image";
import type { SanityProject } from "@/lib/sanity/queries";

interface PresentationModeProps {
  projects: SanityProject[];
  locale: Locale;
}

export function PresentationMode({ projects, locale }: PresentationModeProps) {
  const t = useTranslations("presentation");
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);

  const toggle = useCallback(() => {
    setActive((v) => !v);
    setIndex(0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        e.preventDefault();
        toggle();
      }
      if (!active) return;
      if (e.key === "Escape") setActive(false);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % projects.length);
      if (e.key === "ArrowLeft")
        setIndex((i) => (i - 1 + projects.length) % projects.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, projects.length, toggle]);

  const project = projects[index];
  if (!project) return null;

  const imageUrl = urlFor(project.thumbnail)
    .width(1920)
    .height(1080)
    .fit("crop")
    .url();

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[300] flex flex-col bg-black text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative flex-1">
            <Image
              src={imageUrl}
              alt={getLocalized(project.title, locale)}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-x-0 bottom-0 p-10 md:p-16">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                {project.client}
              </p>
              <h2 className="mt-2 font-display text-4xl font-medium md:text-6xl">
                {getLocalized(project.title, locale)}
              </h2>
              <Link
                href={`/project/${project.slug.current}`}
                className="mt-6 inline-block text-xs uppercase tracking-[0.2em] underline"
                onClick={() => setActive(false)}
              >
                Voir le projet →
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
            <button
              type="button"
              onClick={() =>
                setIndex((i) => (i - 1 + projects.length) % projects.length)
              }
              className="text-xs uppercase tracking-[0.2em]"
            >
              ← {t("prev")}
            </button>
            <span className="text-xs text-white/50">
              {index + 1} / {projects.length}
            </span>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % projects.length)}
              className="text-xs uppercase tracking-[0.2em]"
            >
              {t("next")} →
            </button>
          </div>
          <button
            type="button"
            onClick={() => setActive(false)}
            className="absolute right-6 top-6 text-xs uppercase tracking-[0.2em] text-white/60"
          >
            {t("exit")}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
