"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, locales, type Locale } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 rounded-full border border-neutral-800 p-0.5">
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => router.replace(pathname, { locale: loc })}
          className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] transition-colors ${
            locale === loc
              ? "rounded-full bg-foreground text-background"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          {localeLabels[loc]}
        </button>
      ))}
    </div>
  );
}
