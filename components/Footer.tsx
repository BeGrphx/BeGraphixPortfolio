"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 px-4 py-8 pb-[calc(2rem+env(safe-area-inset-bottom))] dark:border-neutral-900 sm:px-6 md:px-10 md:py-10">
      <div className="mx-auto max-w-7xl text-center md:text-left">
        <p className="text-xs text-muted">
          © {year} BeGraphix — {t("rights")}
        </p>
      </div>
    </footer>
  );
}
