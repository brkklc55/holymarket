import type { Metadata, Viewport } from "next";
import "./globals.css";
import FarcasterProvider from "./components/FarcasterProvider";
import TermsGate from "./components/TermsGate";
import SplashGate from "./components/SplashGate";

const baseUrl = "https://www.baseappholymarket.xyz";

// v34: Aerodrome Standard (Clean Identity)
const fcMiniappMetadata = {
  version: "1",
  name: "HolyMarket",
  iconUrl: `${baseUrl}/icon-1024.png?v=34`,
  homeUrl: `${baseUrl}/`,
  imageUrl: `${baseUrl}/api/og/v34.png`,
  button: {
    title: "Play HolyMarket",
    action: {
      type: "launch_frame",
      name: "HolyMarket",
      url: `${baseUrl}/`,
    }
  }
};

export const metadata: Metadata = {
  description: "HolyMarket: Bet your beliefs on Base.",
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "HolyMarket",
    description: "HolyMarket: Bet your beliefs on Base.",
    url: "/",
    siteName: "HolyMarket",
    type: "website",
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

  const isBot = /bot|crawler|spider|warpcast|farcaster|google|yandex|bing|facebook|twitter|CoinbaseBot|CoinbaseWallet|Toshi|Lighthouse/i.test(userAgent);

  return (
    <html lang="en">
      <head>
        {/* v34: AERODROME CLEAN HEAD - PRIORITY ORDER */}
        <meta charSet="utf-8" />
        <title>HolyMarket</title>
        <meta name="apple-mobile-web-app-title" content="HolyMarket" />
        <meta name="apple-mobile-web-app-capable" content="yes" />

        {/* Branding Assets (v34 Cache Buster) */}
        <link rel="manifest" href="/manifest.json?v=34" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=34" />
        <link rel="shortcut icon" href="/favicon.png?v=34" />

        {/* Third-party Integrations (Lower Priority) */}
        <meta name="fc:miniapp" content={JSON.stringify(fcMiniappMetadata)} />
        <meta name="base:app_id" content="6952a8dc4d3a403912ed8525" />
        <meta name="theme-color" content="#050b1a" />
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
