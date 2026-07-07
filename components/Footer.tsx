"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-900 px-6 py-10 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
        <p className="text-xs text-neutral-600">
          © {year} BeGraphix — {t("rights")}
        </p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-700">
          {t("presentationHint")}
        </p>
      </div>
    </footer>
  );
}
