"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const t = useTranslations("nav");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800/60 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <Link
          href="/"
          className="font-display text-sm font-medium uppercase tracking-[0.25em] text-foreground transition-opacity hover:opacity-60"
        >
          BeGraphix
        </Link>
        <div className="flex items-center gap-3 md:gap-5">
          <Link
            href="/"
            className="hidden text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground sm:inline"
          >
            {t("work")}
          </Link>
          <Link
            href="/about"
            className="hidden text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground sm:inline"
          >
            {t("about")}
          </Link>
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );
}
