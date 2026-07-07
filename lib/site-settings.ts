import { client } from "@/lib/sanity/client";
import { siteSettingsQuery, type SiteSettings } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    return await client.fetch(siteSettingsQuery);
  } catch {
    return null;
  }
}

export function resolveShowreelUrl(settings: SiteSettings | null): string | undefined {
  if (!settings) return undefined;
  return (
    settings.showreelVideoUrl ||
    settings.showreelVideoFile?.asset?.url ||
    undefined
  );
}

export function resolveLogoUrl(settings: SiteSettings | null): string | undefined {
  if (!settings?.logo?.asset?._ref) return undefined;
  return urlFor(settings.logo).width(400).fit("max").url();
}
