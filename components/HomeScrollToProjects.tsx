"use client";

import { useLenis } from "lenis/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const HEADER_OFFSET = 88;

export function HomeScrollToProjects() {
  const searchParams = useSearchParams();
  const lenis = useLenis();
  const filter = searchParams.get("filter");

  useEffect(() => {
    const shouldScroll =
      window.location.hash === "#projects" ||
      filter === "personal" ||
      filter === "professional" ||
      filter === "showreel";

    if (!shouldScroll) return;

    const scrollToProjects = () => {
      const target = document.getElementById("projects");
      if (!target) return;

      const top =
        target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;

      if (lenis) {
        lenis.scrollTo(top, { immediate: true });
      } else {
        window.scrollTo({ top, behavior: "instant" });
      }
    };

    const frame = requestAnimationFrame(scrollToProjects);
    return () => cancelAnimationFrame(frame);
  }, [filter, lenis]);

  return null;
}
