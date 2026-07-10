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
    <div className="flex w-full justify-center">
      <div
        role="tablist"
        aria-label="Filtrer les projets"
        className="relative grid w-full max-w-full grid-cols-3 rounded-full border border-white/20 p-0.5 sm:inline-flex sm:w-auto sm:max-w-none sm:grid-cols-none sm:justify-center sm:p-1"
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
              className={`relative z-10 min-h-10 px-1 py-2 text-[9px] uppercase leading-tight tracking-[0.08em] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-30 sm:min-h-11 sm:px-5 sm:py-2.5 sm:text-xs sm:tracking-[0.2em] ${
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
              <span className="relative flex items-center justify-center gap-1.5 sm:gap-2">
                <span>{filter.label}</span>
                {filter.count !== undefined && (
                  <span
                    className={`text-[9px] sm:text-[10px] ${isActive ? "text-white/70" : "text-white/40"}`}
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
