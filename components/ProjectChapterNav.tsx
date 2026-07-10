"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export interface ProjectChapter {
  id: string;
  label: string;
}

interface ProjectChapterNavProps {
  chapters: ProjectChapter[];
  ariaLabel: string;
}

export function ProjectChapterNav({
  chapters,
  ariaLabel,
}: ProjectChapterNavProps) {
  const [activeId, setActiveId] = useState(chapters[0]?.id ?? "");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("project-scrollbar-hidden");
    return () => {
      document.documentElement.classList.remove("project-scrollbar-hidden");
    };
  }, []);

  useEffect(() => {
    if (chapters.length < 2) return;

    let frame = 0;

    const updateActiveChapter = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const pageBottom =
          document.documentElement.scrollHeight - window.innerHeight;
        if (window.scrollY >= pageBottom - 8) {
          const lastId = chapters.at(-1)?.id ?? "";
          setActiveId((current) => (current === lastId ? current : lastId));
          return;
        }

        const focusLine = window.innerHeight * 0.42;
        let closestId = chapters[0]?.id ?? "";
        let closestDistance = Number.POSITIVE_INFINITY;

        chapters.forEach(({ id }) => {
          const element = document.getElementById(id);
          if (!element) return;

          const rect = element.getBoundingClientRect();
          const distance =
            rect.top <= focusLine && rect.bottom >= focusLine
              ? 0
              : Math.min(
                  Math.abs(rect.top - focusLine),
                  Math.abs(rect.bottom - focusLine),
                );

          if (distance < closestDistance) {
            closestDistance = distance;
            closestId = id;
          }
        });

        setActiveId((current) => (current === closestId ? current : closestId));
      });
    };

    updateActiveChapter();
    window.addEventListener("scroll", updateActiveChapter, { passive: true });
    window.addEventListener("resize", updateActiveChapter);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActiveChapter);
      window.removeEventListener("resize", updateActiveChapter);
    };
  }, [chapters]);

  if (chapters.length < 2) return null;

  const goToChapter = (id: string) => {
    if (id === "project-home") {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
      return;
    }

    const element = document.getElementById(id);
    if (!element) return;

    const top = element.getBoundingClientRect().top + window.scrollY - 112;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <nav
      aria-label={ariaLabel}
      className="fixed right-2 top-1/2 z-40 -translate-y-1/2 sm:right-4 md:right-5"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setExpanded(false);
        }
      }}
    >
      <div className="flex flex-col items-end gap-0.5 rounded-[1.4rem] border border-white/15 bg-black/35 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl backdrop-saturate-150">
        {chapters.map((chapter, index) => {
          const active = activeId === chapter.id;

          return (
            <button
              key={chapter.id}
              type="button"
              aria-label={`${index + 1}. ${chapter.label}`}
              aria-current={active ? "location" : undefined}
              onClick={() => goToChapter(chapter.id)}
              className={`relative flex min-h-8 items-center justify-end overflow-hidden rounded-full px-2 transition-colors sm:min-h-9 ${
                active ? "text-white" : "text-white/45 hover:text-white/80"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="project-chapter-active"
                  className="absolute inset-0 rounded-full bg-white/12"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}

              <span
                className={`relative overflow-hidden whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.12em] transition-[max-width,margin,opacity] duration-300 sm:text-[10px] ${
                  expanded || active
                    ? "mr-2 max-w-28 opacity-100"
                    : "mr-0 max-w-0 opacity-0"
                }`}
              >
                {chapter.label}
              </span>

              <span
                aria-hidden="true"
                className={`relative block h-1 rounded-full transition-all duration-300 ${
                  active
                    ? "w-5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.35)]"
                    : "w-1.5 bg-white/35"
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
