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
    <div className="relative mb-14 inline-flex rounded-full border border-neutral-300 p-1 dark:border-neutral-800 md:mb-20">
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
              isActive
                ? "text-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="project-filter-pill"
                className="absolute inset-0 rounded-full bg-foreground"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              {filter.label}
              <span
                className={`text-[10px] ${isActive ? "text-background/60" : "text-muted"}`}
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
