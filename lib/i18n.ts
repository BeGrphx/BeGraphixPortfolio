import { unstable_cache } from "next/cache";
import type { Locale } from "@/i18n/routing";
import { translateTextServer } from "./translate-server";

export interface LocalizedValue {
  fr?: string;
  en?: string;
  es?: string;
}

export function getLocalized(
  value: LocalizedValue | string | null | undefined,
  locale: Locale,
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale] || value.fr || value.en || value.es || "";
}

const cachedTranslate = (text: string, locale: Locale) =>
  unstable_cache(
    async () => translateTextServer(text, locale as "en" | "es"),
    [`auto-translate`, text, locale],
    { revalidate: 86400 },
  )();

export async function getLocalizedAuto(
  value: LocalizedValue | string | null | undefined,
  locale: Locale,
): Promise<string> {
  if (!value) return "";
  if (typeof value === "string") {
    if (locale === "fr") return value;
    return cachedTranslate(value, locale);
  }

  if (value[locale]?.trim()) return value[locale]!;
  if (locale === "fr") return value.fr || "";
  if (!value.fr?.trim()) return value.en || value.es || "";

  const translated = await cachedTranslate(value.fr, locale);
  if (
    translated.toUpperCase().includes("QUERY LENGTH LIMIT") ||
    translated.toUpperCase().includes("MAX ALLOWED QUERY")
  ) {
    return value.fr;
  }
  return translated;
}

export function hasLocalizedContent(value: LocalizedValue | undefined): boolean {
  if (!value) return false;
  return Boolean(value.fr || value.en || value.es);
}
