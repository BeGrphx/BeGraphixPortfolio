"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { GrainOverlay } from "@/components/GrainOverlay";
import { Header } from "@/components/Header";
import { PageTransition } from "@/components/PageTransition";
import { SiteLoader } from "@/components/SiteLoader";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { ThemeProviderWrapper } from "@/components/providers/ThemeProviderWrapper";

interface AppProvidersProps {
  children: ReactNode;
  locale: string;
  messages: Record<string, unknown>;
  logoUrl?: string;
}

export function AppProviders({
  children,
  locale,
  messages,
  logoUrl,
}: AppProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProviderWrapper>
        <LenisProvider>
          <SiteLoader logoUrl={logoUrl} />
          <GrainOverlay />
          <Header />
          <PageTransition>
            <main>{children}</main>
          </PageTransition>
          <Footer />
          <Analytics />
          <SpeedInsights />
        </LenisProvider>
      </ThemeProviderWrapper>
    </NextIntlClientProvider>
  );
}
