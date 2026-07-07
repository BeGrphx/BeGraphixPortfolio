"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className="inline-block h-8 w-8" />;

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-sm transition-colors hover:border-neutral-500 dark:border-neutral-700 dark:hover:border-neutral-500"
      aria-label={isDark ? "Mode clair" : "Mode sombre"}
    >
      {isDark ? "☀" : "☾"}
    </button>
  );
}
