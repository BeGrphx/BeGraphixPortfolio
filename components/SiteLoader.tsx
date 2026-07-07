"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export function SiteLoader() {
  const t = useTranslations("loader");
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
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="font-display text-2xl font-medium tracking-tight">
              BeGraphix
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-muted">
              {t("loading")}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
