"use client";

import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, locales, type Locale } from "@/i18n/routing";

interface LanguageSwitcherProps {
  compact?: boolean;
}

function buildLocalizedHref(
  pathname: string,
  searchParams: URLSearchParams,
  hash: string,
) {
  const base = pathname || "/";
  const query = searchParams.toString();
  if (query) return `${base}?${query}${hash}`;
  return `${base}${hash}`;
}

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  return (
    <div
      className={`flex items-center gap-0.5 rounded-full border border-neutral-300 p-0.5 dark:border-neutral-800 ${
        compact ? "scale-95" : ""
      } ${pending ? "opacity-60" : ""}`}
      role="group"
      aria-label="Langue"
    >
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          disabled={pending || locale === loc}
          onClick={() => {
            startTransition(() => {
              const href = buildLocalizedHref(
                pathname,
                searchParams,
                window.location.hash,
              );
              router.replace(href, { locale: loc, scroll: false });
            });
          }}
          className={`relative z-10 min-h-9 min-w-9 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.12em] transition-colors sm:min-h-0 sm:min-w-0 sm:px-2.5 sm:py-1 ${
            locale === loc
              ? "rounded-full bg-foreground text-background"
              : "text-muted hover:text-foreground"
          }`}
        >
          {localeLabels[loc]}
        </button>
      ))}
    </div>
  );
}
