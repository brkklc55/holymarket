import type { Metadata, Viewport } from "next";
import "./globals.css";
import FarcasterProvider from "./components/FarcasterProvider";
import TermsGate from "./components/TermsGate";
import SplashGate from "./components/SplashGate";

const baseUrl = "https://www.baseappholymarket.xyz";

export const metadata: Metadata = {
  title: "HolyMarket",
  applicationName: "HolyMarket",
  description: "HolyMarket: Bet your beliefs on Base.",
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "https://www.baseappholymarket.xyz/",
  },
  icons: {
    icon: [{ url: "/icon-1024.png", sizes: "any" }],
    shortcut: ["/icon-1024.png"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "HolyMarket",
    description: "HolyMarket: Bet your beliefs on Base.",
    url: "https://www.baseappholymarket.xyz/",
    siteName: "HolyMarket",
    images: [
      {
        url: "/api/og?v=18",
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: "HolyMarket",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HolyMarket",
    description: "HolyMarket: Bet your beliefs on Base.",
    images: ["/api/og?v=18"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HolyMarket",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "HolyMarket",
    "apple-mobile-web-app-title": "HolyMarket",
    "msapplication-starturl": "/",
    "msapplication-navbutton-color": "#050b1a",
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#050b1a",
};

import { Providers } from "./providers";
import { headers } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const heads = await headers();
  const userAgent = heads.get("user-agent") || "";

  // v18 REVISION: Including coinbase and wallet back to bot detection
  // but keeping actual mobile strings OUT of it.
  // This ensures Coinbase Pinning Robots see the metadata-only version
  // and pick up the correct title and icon instantly.
  const isBot = /bot|crawler|spider|warpcast|farcaster|coinbase|wallet|toshi|googlebot|yandexbot/i.test(userAgent);

  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <Providers>
          <FarcasterProvider>
            {isBot ? (
              <>{children}</>
            ) : (
              <SplashGate>
                <TermsGate>{children}</TermsGate>
              </SplashGate>
            )}
          </FarcasterProvider>
        </Providers>
      </body>
    </html>
  );
}
