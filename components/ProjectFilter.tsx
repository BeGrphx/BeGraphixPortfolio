"use client";

import { motion } from "framer-motion";
import type { ProjectType } from "@/lib/sanity/queries";

export type FilterValue = "all" | ProjectType;

interface ProjectFilterProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  counts: { professional: number; personal: number };
}

const filters: { value: FilterValue; label: string }[] = [
  { value: "professional", label: "Professionnel" },
  { value: "personal", label: "Personnel" },
];

export function ProjectFilter({
  value,
  onChange,
  counts,
}: ProjectFilterProps) {
  return (
    <div className="mb-14 flex flex-col gap-6 md:mb-20 md:flex-row md:items-center md:justify-between">
      <div className="relative inline-flex rounded-full border border-neutral-800 p-1">
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
                isActive ? "text-background" : "text-neutral-400 hover:text-neutral-200"
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
                  className={`text-[10px] ${isActive ? "text-background/60" : "text-neutral-600"}`}
                >
                  {count}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-600">
        Tri chronologique
      </p>
    </div>
  );
}
