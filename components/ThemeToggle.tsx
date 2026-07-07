"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("theme");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="text-[10px] uppercase tracking-[0.15em] text-neutral-500 transition-colors hover:text-neutral-300"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? t("light") : t("dark")}
    </button>
  );
}
