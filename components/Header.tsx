"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const t = useTranslations("nav");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <Link
          href="/"
          className="text-sm font-medium uppercase tracking-[0.25em] text-white transition-opacity hover:opacity-60"
        >
          BeGraphix
        </Link>
        <div className="flex items-center gap-4 md:gap-6">
          <Link
            href="/"
            className="hidden text-xs uppercase tracking-[0.2em] text-white/80 transition-opacity hover:opacity-100 sm:inline"
          >
            {t("work")}
          </Link>
          <Link
            href="/about"
            className="hidden text-xs uppercase tracking-[0.2em] text-white/80 transition-opacity hover:opacity-100 sm:inline"
          >
            {t("about")}
          </Link>
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );
}
