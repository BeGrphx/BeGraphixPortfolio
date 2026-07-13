"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Suspense, useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { lockPageScroll, unlockPageScroll } from "@/lib/scroll";
import { useLenis } from "lenis/react";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const lenis = useLenis();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    lockPageScroll(lenis);
    return () => unlockPageScroll(lenis);
  }, [menuOpen, lenis]);

  const navLinks = [
    { href: "/", label: t("work") },
    { href: "/about", label: t("about") },
  ] as const;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-neutral-800/60 bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 md:px-10 md:py-5">
        <Link
          href="/"
          className="font-display text-sm font-medium uppercase tracking-[0.25em] text-foreground transition-opacity hover:opacity-60"
          onClick={() => setMenuOpen(false)}
        >
          BeGraphix
        </Link>

        <div className="hidden items-center gap-3 sm:flex md:gap-5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Suspense fallback={null}>
            <LanguageSwitcher />
          </Suspense>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <Suspense fallback={null}>
            <LanguageSwitcher compact />
          </Suspense>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-700/70 text-lg text-foreground transition-colors active:bg-white/10"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-x-0 top-full border-b border-neutral-800/60 bg-background/98 backdrop-blur-xl sm:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col px-4 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center text-sm uppercase tracking-[0.22em] text-foreground transition-opacity active:opacity-60"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
