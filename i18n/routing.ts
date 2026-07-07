import { defineRouting } from "next-intl/routing";

export const locales = ["fr", "en", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export const localeLabels: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
  es: "ES",
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});
