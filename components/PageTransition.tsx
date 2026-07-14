"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useVisualEffect } from "@/hooks/useVisualEffectsCapabilities";
import { usePathname } from "@/i18n/navigation";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const enabled = useVisualEffect("pageTransition");

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
