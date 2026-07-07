"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { ProjectType } from "@/lib/sanity/queries";

export type FilterValue = "showreel" | ProjectType;

interface ProjectFilterProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  counts: { professional: number; personal: number };
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
    { value: "showreel", label: t("showreel") },
    { value: "professional", label: t("professional"), count: counts.professional },
    { value: "personal", label: t("personal"), count: counts.personal },
  ];

  return (
    <div className="relative mb-14 inline-flex flex-wrap justify-center rounded-full border border-white/20 p-1 md:mb-20">
      {filters.map((filter) => {
        const isActive = value === filter.value;
        const disabled = filter.value === "showreel" && !hasShowreel;

        return (
          <button
            key={filter.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(filter.value)}
            className={`relative z-10 px-5 py-2.5 text-xs uppercase tracking-[0.2em] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-30 ${
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
            <span className="relative flex items-center gap-2">
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
  );
}
