"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface ShowreelPlayerProps {
  url?: string;
}

export function ShowreelPlayer({ url }: ShowreelPlayerProps) {
  const t = useTranslations("home");

  if (!url) {
    return (
      <div className="rounded-lg border border-dashed border-white/20 px-8 py-16 text-center">
        <p className="text-white/70">{t("noShowreel")}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden bg-neutral-950"
    >
      <video
        src={url}
        controls
        playsInline
        preload="metadata"
        className="aspect-video w-full object-contain"
      />
    </motion.div>
  );
}
