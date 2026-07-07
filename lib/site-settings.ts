import { client } from "@/lib/sanity/client";
import { siteSettingsQuery, type SiteSettings } from "@/lib/sanity/queries";

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    return await client.withConfig({ useCdn: false }).fetch(
      siteSettingsQuery,
      {},
      { next: { revalidate: 30 } },
    );
  } catch {
    return null;
  }
}

export function resolveShowreelUrl(
  settings: SiteSettings | null,
): string | undefined {
  if (!settings) return undefined;
  return settings.showreelVideoUrl || undefined;
}

export function resolveLogoUrl(
  settings: SiteSettings | null,
): string | undefined {
  return settings?.logoUrl || undefined;
}
