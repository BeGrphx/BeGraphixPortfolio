import { Syne, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";

const loaderBootstrapScript = `(function(){try{if(sessionStorage.getItem('begraphix-loaded')){document.documentElement.classList.add('begraphix-ready');}else{document.documentElement.classList.add('begraphix-loading');}}catch(e){document.documentElement.classList.add('begraphix-ready');}})();`;

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
        <Script
          id="begraphix-loader-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: loaderBootstrapScript }}
        />
      </head>
      <body
        className={`${syne.variable} ${dmSans.variable} ${ibmMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
