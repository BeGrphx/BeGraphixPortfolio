import type { Locale } from "@/i18n/routing";

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

export function hasLocalizedContent(value: LocalizedValue | undefined): boolean {
  if (!value) return false;
  return Boolean(value.fr || value.en || value.es);
}
