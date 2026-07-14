"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { AnalyticsPageView } from "@/components/AnalyticsPageView";
import { Footer } from "@/components/Footer";
import { GrainOverlay } from "@/components/GrainOverlay";
import { Header } from "@/components/Header";
import { PageTransition } from "@/components/PageTransition";
import { ScrollToTopOnNavigate } from "@/components/ScrollToTopOnNavigate";
import { LenisProvider } from "@/components/providers/LenisProvider";

interface AppProvidersProps {
  children: ReactNode;
  locale: string;
  messages: Record<string, unknown>;
}

export function AppProviders({
  children,
  locale,
  messages,
}: AppProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LenisProvider>
        <ScrollToTopOnNavigate />
        <GrainOverlay />
        <Header />
        <PageTransition>
          <main>{children}</main>
        </PageTransition>
        <Footer />
        <Analytics />
        <AnalyticsPageView />
        <SpeedInsights />
      </LenisProvider>
    </NextIntlClientProvider>
  );
}
