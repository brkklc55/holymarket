import type { Metadata, Viewport } from "next";
import "./globals.css";
import FarcasterProvider from "./components/FarcasterProvider";
import TermsGate from "./components/TermsGate";
import SplashGate from "./components/SplashGate";

const baseUrl = "https://www.baseappholymarket.xyz";

// v26: Aerodrome/Uniswap Standard Serialized Metadata
const fcMiniappMetadata = {
  version: "1",
  name: "HolyMarket",
  iconUrl: "https://www.baseappholymarket.xyz/icon-1024.png",
  homeUrl: "https://www.baseappholymarket.xyz/",
  imageUrl: "https://www.baseappholymarket.xyz/api/og?v=26",
  button: {
    title: "Play HolyMarket",
    action: {
      type: "launch_frame",
      name: "HolyMarket",
      url: "https://www.baseappholymarket.xyz/",
    }
  }
};

export const metadata: Metadata = {
  // Removed title and manifest from here to force manual placement in <head> for priority
  description: "HolyMarket: Bet your beliefs on Base.",
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
  },
  openGraph: {
    title: "HolyMarket",
    description: "HolyMarket: Bet your beliefs on Base.",
    url: "/",
    siteName: "HolyMarket",
    images: [
      {
        url: "/api/og?v=26",
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
    images: ["/api/og?v=26"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HolyMarket",
  },
  other: {
    "fc:miniapp": JSON.stringify(fcMiniappMetadata),
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes"
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

  // v26: Strict bot detection for Coinbase Pinning
  const isBot = /bot|crawler|spider|warpcast|farcaster|google|yandex|bing|facebook|twitter|CoinbaseBot|CoinbaseWallet/i.test(userAgent);

  return (
    <html lang="en">
      <head>
        {/* v26: MANDATORY PRIORITY TAGS (Aerodrome Style) */}
        {/* These must be at the very top of the head to ensure bot parsing */}
        <meta charSet="utf-8" />
        <title>HolyMarket</title>
        <meta name="application-name" content="HolyMarket" />
        <meta name="apple-mobile-web-app-title" content="HolyMarket" />
        <link rel="manifest" href="https://www.baseappholymarket.xyz/manifest.json" />
        <link rel="apple-touch-icon" href="https://www.baseappholymarket.xyz/apple-touch-icon.png" sizes="180x180" />
        <meta name="fc:miniapp" content={JSON.stringify(fcMiniappMetadata)} />
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
