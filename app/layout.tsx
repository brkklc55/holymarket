import type { Metadata, Viewport } from "next";
import "./globals.css";
import FarcasterProvider from "./components/FarcasterProvider";
import TermsGate from "./components/TermsGate";
import SplashGate from "./components/SplashGate";

const baseUrl = "https://www.baseappholymarket.xyz";

// v33: Final Stand (Precise PWA Cache Busting)
const fcMiniappMetadata = {
  version: "1",
  name: "HolyMarket",
  iconUrl: `${baseUrl}/icon-1024.png?v=33`,
  homeUrl: `${baseUrl}/`,
  imageUrl: `${baseUrl}/api/og/v33.png`,
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
        {/* v33: ABSOLUTE TOP PRIORITY (Legacy & Modern PWA Mix) */}
        <meta charSet="utf-8" />
        <title>HolyMarket</title>
        <meta name="apple-mobile-web-app-title" content="HolyMarket" />
        <meta name="application-name" content="HolyMarket" />

        {/* Precise Metadata Position (Coinbase bot expectation) */}
        <link rel="manifest" href="https://www.baseappholymarket.xyz/manifest.json?v=33" />
        <link rel="apple-touch-icon" href="https://www.baseappholymarket.xyz/apple-touch-icon.png?v=33" />
        <link rel="apple-touch-icon-precomposed" href="https://www.baseappholymarket.xyz/apple-touch-icon.png?v=33" />
        <link rel="icon" type="image/png" sizes="32x32" href="https://www.baseappholymarket.xyz/favicon.png?v=33" />

        {/* Branding & Registry */}
        <meta name="fc:miniapp" content={JSON.stringify(fcMiniappMetadata)} />
        <meta name="base:app_id" content="6952a8dc4d3a403912ed8525" />
        <meta name="theme-color" content="#050b1a" />

        {/* Legacy Capabilities */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
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
