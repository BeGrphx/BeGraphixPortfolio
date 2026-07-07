import type { Locale } from "@/i18n/routing";
import { getLocalizedAuto } from "@/lib/i18n";
import type { SanityShowreel, ShowreelWithDisplay } from "@/lib/sanity/queries";

export async function localizeShowreels(
  showreels: SanityShowreel[],
  locale: Locale,
): Promise<ShowreelWithDisplay[]> {
  return Promise.all(
    showreels.map(async (showreel) => ({
      ...showreel,
      displayTitle: await getLocalizedAuto(showreel.title, locale),
    })),
  );
}
