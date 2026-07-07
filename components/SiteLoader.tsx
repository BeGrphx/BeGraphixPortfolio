"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

interface SiteLoaderProps {
  logoUrl?: string;
}

export function SiteLoader({ logoUrl }: SiteLoaderProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const seen = sessionStorage.getItem("begraphix-loaded");
    if (seen) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => {
      sessionStorage.setItem("begraphix-loaded", "1");
      setVisible(false);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {logoUrl ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-16 w-48 md:h-20 md:w-56"
            >
              <Image
                src={logoUrl}
                alt="BeGraphix"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
          ) : (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-2xl font-medium tracking-tight"
            >
              BeGraphix
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
