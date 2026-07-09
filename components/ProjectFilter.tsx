"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { ProjectType } from "@/lib/sanity/queries";

export type FilterValue = "showreel" | ProjectType;

interface ProjectFilterProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  counts: { showreel: number; professional: number; personal: number };
  hasShowreel: boolean;
}

export function ProjectFilter({
  value,
  onChange,
  counts,
  hasShowreel,
}: ProjectFilterProps) {
  const t = useTranslations("filter");

  const filters: {
    value: FilterValue;
    label: string;
    count?: number;
  }[] = [
    { value: "showreel", label: t("showreel"), count: counts.showreel },
    {
      value: "professional",
      label: t("professional"),
      count: counts.professional,
    },
    { value: "personal", label: t("personal"), count: counts.personal },
  ];

  return (
    <div className="-mx-1 w-[calc(100%+0.5rem)] overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:w-auto sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
      <div
        role="tablist"
        aria-label="Filtrer les projets"
        className="relative inline-flex min-w-max flex-nowrap justify-center rounded-full border border-white/20 p-1"
      >
        {filters.map((filter) => {
          const isActive = value === filter.value;
          const disabled = filter.value === "showreel" && !hasShowreel;

          return (
            <button
              key={filter.value}
              type="button"
              role="tab"
              disabled={disabled}
              aria-selected={isActive}
              aria-pressed={isActive}
              onClick={() => onChange(filter.value)}
              className={`relative z-10 min-h-11 shrink-0 px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-30 sm:px-5 sm:text-xs sm:tracking-[0.2em] ${
                isActive ? "text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="project-filter-pill"
                  className="absolute inset-0 rounded-full bg-white/15"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-1.5 sm:gap-2">
                {filter.label}
                {filter.count !== undefined && (
                  <span
                    className={`text-[10px] ${isActive ? "text-white/70" : "text-white/40"}`}
                  >
                    {filter.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
