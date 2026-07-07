"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

const STORAGE_KEY = "begraphix-loaded";

interface SiteLoaderProps {
  logoUrl?: string;
}

export function SiteLoader({ logoUrl }: SiteLoaderProps) {
  const [visible, setVisible] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<"enter" | "exit">("enter");

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const enterDone = setTimeout(() => setPhase("exit"), 1000);
    const hide = setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setVisible(false);
    }, 2200);

    return () => {
      clearTimeout(enterDone);
      clearTimeout(hide);
    };
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "exit" ? 0 : 1 }}
          transition={{
            duration: 0.7,
            delay: phase === "exit" ? 0.4 : 0,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <motion.div
            className="absolute inset-0 bg-background"
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === "exit" ? 0 : 1 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          />

          {logoUrl ? (
            <motion.div
              className="relative z-10 h-24 w-64 md:h-28 md:w-72"
              initial={{ opacity: 0, scale: 0.35 }}
              animate={
                phase === "exit"
                  ? { opacity: 0, scale: 1.65 }
                  : { opacity: 1, scale: 1 }
              }
              transition={{
                duration: phase === "exit" ? 0.75 : 0.85,
                ease: [0.16, 1, 0.3, 1],
              }}
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
              className="relative z-10 font-display text-3xl font-medium tracking-tight md:text-4xl"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={
                phase === "exit"
                  ? { opacity: 0, scale: 1.5 }
                  : { opacity: 1, scale: 1 }
              }
              transition={{
                duration: phase === "exit" ? 0.75 : 0.85,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              BeGraphix
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
