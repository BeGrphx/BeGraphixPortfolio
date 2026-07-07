"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "begraphix-loaded";
const ENTER_HOLD_MS = 2000;
const TOTAL_MS = 3000;

interface SiteLoaderContextValue {
  contentReady: boolean;
}

const SiteLoaderContext = createContext<SiteLoaderContextValue>({
  contentReady: true,
});

export function useSiteLoader() {
  return useContext(SiteLoaderContext);
}

function markReady() {
  document.documentElement.classList.remove("begraphix-loading");
  document.documentElement.classList.add("begraphix-ready");
}

function markLoading() {
  document.documentElement.classList.add("begraphix-loading");
  document.documentElement.classList.remove("begraphix-ready");
}

interface SiteLoaderProviderProps {
  children: ReactNode;
  logoUrl?: string;
}

export function SiteLoaderProvider({
  children,
  logoUrl,
}: SiteLoaderProviderProps) {
  const [showLoader, setShowLoader] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem(STORAGE_KEY);
  });
  const [contentReady, setContentReady] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!sessionStorage.getItem(STORAGE_KEY);
  });
  const [phase, setPhase] = useState<"enter" | "exit">("enter");

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) {
      markReady();
      setShowLoader(false);
      setContentReady(true);
      return;
    }

    markLoading();
    setShowLoader(true);
    setContentReady(false);

    const enterDone = setTimeout(() => setPhase("exit"), ENTER_HOLD_MS);
    const reveal = setTimeout(() => {
      setContentReady(true);
      markReady();
    }, TOTAL_MS - 350);
    const hide = setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setShowLoader(false);
    }, TOTAL_MS);

    return () => {
      clearTimeout(enterDone);
      clearTimeout(reveal);
      clearTimeout(hide);
    };
  }, []);

  return (
    <SiteLoaderContext.Provider value={{ contentReady }}>
      {showLoader && (
        <AnimatePresence>
          <motion.div
            key="loader"
            className="fixed inset-0 z-[200] flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === "exit" ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.85,
              delay: phase === "exit" ? 0.35 : 0,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <motion.div
              className="absolute inset-0 bg-background"
              initial={{ opacity: 1 }}
              animate={{ opacity: phase === "exit" ? 0 : 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
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
                  duration: phase === "exit" ? 0.9 : 1,
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
                  duration: phase === "exit" ? 0.9 : 1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                BeGraphix
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <div
        className="transition-opacity duration-700 ease-out"
        style={{ opacity: contentReady ? 1 : 0 }}
        aria-hidden={!contentReady}
      >
        {children}
      </div>
    </SiteLoaderContext.Provider>
  );
}
