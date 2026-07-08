"use client";

import { useLenis } from "lenis/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { shouldSkipScrollToTop } from "@/lib/scroll";

const HEADER_OFFSET = 88;

export function HomeScrollToProjects() {
  const searchParams = useSearchParams();
  const lenis = useLenis();
  const filter = searchParams.get("filter");

  useEffect(() => {
    if (!shouldSkipScrollToTop("/")) return;

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
