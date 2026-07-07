import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import { AppProviders } from "@/components/providers/AppProviders";
import { routing } from "@/i18n/routing";
import { getSiteSettings, resolveLogoUrl } from "@/lib/site-settings";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "fr" | "en" | "es")) {
    notFound();
  }

  setRequestLocale(locale);
  const [messages, settings] = await Promise.all([
    getMessages(),
    getSiteSettings(),
  ]);
  const logoUrl = resolveLogoUrl(settings);

  return (
    <AppProviders locale={locale} messages={messages} logoUrl={logoUrl}>
      {children}
    </AppProviders>
  );
}
