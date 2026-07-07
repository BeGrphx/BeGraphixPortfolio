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
const LOGO_HOLD_MS = 400;
const LOGO_EXIT_MS = 250;
const SCREEN_FADE_MS = 350;
const LOGO_ENTER_S = 0.35;
const SAFETY_MS = 2000;

type LoaderPhase = "idle" | "enter" | "logo-exit" | "screen-fade";

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

function finishLoader(setPhase: (p: LoaderPhase) => void) {
  sessionStorage.setItem(STORAGE_KEY, "1");
  markReady();
  setPhase("idle");
}

interface SiteLoaderProviderProps {
  children: ReactNode;
  logoUrl?: string;
}

export function SiteLoaderProvider({
  children,
  logoUrl,
}: SiteLoaderProviderProps) {
  const [phase, setPhase] = useState<LoaderPhase>("idle");

  useEffect(() => {
    let logoExit: ReturnType<typeof setTimeout>;
    let screenFade: ReturnType<typeof setTimeout>;
    let finish: ReturnType<typeof setTimeout>;
    let safety: ReturnType<typeof setTimeout>;

    if (sessionStorage.getItem(STORAGE_KEY)) {
      markReady();
      setPhase("idle");
      return;
    }

    markLoading();
    setPhase("enter");

    logoExit = setTimeout(() => setPhase("logo-exit"), LOGO_HOLD_MS);
    screenFade = setTimeout(
      () => setPhase("screen-fade"),
      LOGO_HOLD_MS + LOGO_EXIT_MS,
    );
    finish = setTimeout(
      () => finishLoader(setPhase),
      LOGO_HOLD_MS + LOGO_EXIT_MS + SCREEN_FADE_MS,
    );
    safety = setTimeout(() => finishLoader(setPhase), SAFETY_MS);

    return () => {
      clearTimeout(logoExit);
      clearTimeout(screenFade);
      clearTimeout(finish);
      clearTimeout(safety);
    };
  }, []);

  const isLoading = phase !== "idle";

  return (
    <SiteLoaderContext.Provider value={{ contentReady: !isLoading }}>
      {isLoading && (
        <div className="fixed inset-0 z-[200]">
          <motion.div
            className="absolute inset-0 bg-background"
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === "screen-fade" ? 0 : 1 }}
            transition={{
              duration: SCREEN_FADE_MS / 1000,
              ease: [0.4, 0, 0.2, 1],
            }}
          />

          <AnimatePresence>
            {phase !== "screen-fade" && (
              <motion.div
                key="logo"
                className="absolute inset-0 flex items-center justify-center"
                initial={false}
              >
                {logoUrl ? (
                  <motion.div
                    className="relative h-24 w-64 md:h-28 md:w-72"
                    initial={{ opacity: 0, scale: 0.35 }}
                    animate={
                      phase === "logo-exit"
                        ? { opacity: 0, scale: 1.65 }
                        : { opacity: 1, scale: 1 }
                    }
                    transition={{
                      duration:
                        phase === "logo-exit" ? LOGO_EXIT_MS / 1000 : LOGO_ENTER_S,
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
                    className="font-display text-3xl font-medium tracking-tight md:text-4xl"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={
                      phase === "logo-exit"
                        ? { opacity: 0, scale: 1.5 }
                        : { opacity: 1, scale: 1 }
                    }
                    transition={{
                      duration:
                        phase === "logo-exit" ? LOGO_EXIT_MS / 1000 : LOGO_ENTER_S,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    BeGraphix
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {children}
    </SiteLoaderContext.Provider>
  );
}
