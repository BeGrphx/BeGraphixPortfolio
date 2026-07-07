"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { formatProjectDateShort } from "@/lib/media";
import type { ShowreelWithDisplay } from "@/lib/sanity/queries";

interface ShowreelListProps {
  showreels: ShowreelWithDisplay[];
}

export function ShowreelList({ showreels }: ShowreelListProps) {
  const t = useTranslations("home");

  if (showreels.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/20 px-8 py-16 text-center">
        <p className="text-white/70">{t("noShowreel")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-14 md:gap-20">
      {showreels.map((item, index) => (
        <motion.article
          key={item._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.45,
            delay: index * 0.05,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="relative aspect-video overflow-hidden bg-neutral-900">
            <video
              src={item.videoUrl}
              controls
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium tracking-tight text-white md:text-xl">
                {item.displayTitle}
              </h2>
              <p className="mt-1 text-xs uppercase tracking-wider text-white/50">
                {item.theme}
                {item.completedAt
                  ? ` · ${formatProjectDateShort(item.completedAt)}`
                  : ""}
              </p>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
