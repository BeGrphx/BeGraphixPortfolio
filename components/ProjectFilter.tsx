"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { ProjectType } from "@/lib/sanity/queries";

export type FilterValue = ProjectType;

interface ProjectFilterProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  counts: { professional: number; personal: number };
}

export function ProjectFilter({
  value,
  onChange,
  counts,
}: ProjectFilterProps) {
  const t = useTranslations("filter");

  const filters: { value: FilterValue; label: string }[] = [
    { value: "professional", label: t("professional") },
    { value: "personal", label: t("personal") },
  ];

  return (
    <div className="relative mb-14 inline-flex rounded-full border border-white/20 p-1 md:mb-20">
      {filters.map((filter) => {
        const isActive = value === filter.value;
        const count =
          filter.value === "professional"
            ? counts.professional
            : counts.personal;

        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={`relative z-10 px-5 py-2.5 text-xs uppercase tracking-[0.2em] transition-colors duration-300 ${
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
              <span
                className={`text-[10px] ${isActive ? "text-white/70" : "text-white/40"}`}
              >
                {count}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
