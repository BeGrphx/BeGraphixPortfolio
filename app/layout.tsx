import { Syne, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { siteTitle } from "@/lib/metadata";

export const metadata: Metadata = {
  title: siteTitle,
  icons: {
    icon: [{ url: "/brand/begraphix-logo.png", type: "image/png" }],
    apple: [{ url: "/brand/begraphix-logo.png", type: "image/png" }],
    shortcut: ["/brand/begraphix-logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#080808",
};

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const ibmMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
      </head>
      <body
        className={`${syne.variable} ${dmSans.variable} ${ibmMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
