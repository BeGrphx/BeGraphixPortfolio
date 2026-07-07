"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 px-6 py-10 dark:border-neutral-900 md:px-10">
      <div className="mx-auto max-w-7xl text-center md:text-left">
        <p className="text-xs text-muted">
          © {year} BeGraphix — {t("rights")}
        </p>
      </div>
    </footer>
  );
}
