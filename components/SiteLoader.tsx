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
    const timer = setTimeout(() => setVisible(false), 1400);
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
              className="relative h-20 w-56 md:h-24 md:w-64"
            >
              <Image
                src={logoUrl}
                alt="BeGraphix"
                fill
                unoptimized
                className="object-contain"
                priority
              />
            </motion.div>
          ) : (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
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
