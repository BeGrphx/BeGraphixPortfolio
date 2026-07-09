"use client";

import { useLenis } from "lenis/react";
import { useEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";
import { shouldSkipScrollToTop } from "@/lib/scroll";

const HEADER_GAP = 8;

export function HomeScrollToProjects() {
  const pathname = usePathname();
  const lenis = useLenis();
  const isInitialMount = useRef(true);
  const prevPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (!shouldSkipScrollToTop(pathname)) return;

    const pathnameChanged =
      prevPathnameRef.current !== null && prevPathnameRef.current !== pathname;
    const isInitial = isInitialMount.current;
    isInitialMount.current = false;
    prevPathnameRef.current = pathname;

    if (!isInitial && !pathnameChanged) return;

    const scrollToProjects = () => {
      const target = document.getElementById("projects");
      if (!target) return;

      const header = document.querySelector("header");
      const headerOffset = (header?.offsetHeight ?? 88) + HEADER_GAP;
      const top =
        target.getBoundingClientRect().top + window.scrollY - headerOffset;

      if (lenis) {
        lenis.scrollTo(top, { immediate: true });
      } else {
        window.scrollTo({ top, behavior: "instant" });
      }
    };

    const frame = requestAnimationFrame(scrollToProjects);
    return () => cancelAnimationFrame(frame);
  }, [pathname, lenis]);

  return null;
}
