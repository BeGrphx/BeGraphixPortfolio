"use client";

import { useLenis } from "lenis/react";
import { usePathname } from "@/i18n/navigation";
import { useEffect } from "react";
import { scrollToTop, shouldSkipScrollToTop } from "@/lib/scroll";

export function ScrollToTopOnNavigate() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (shouldSkipScrollToTop(pathname)) return;

    const frame = requestAnimationFrame(() => {
      scrollToTop(lenis);
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname, lenis]);

  return null;
}
