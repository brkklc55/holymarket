import type { Metadata, Viewport } from "next";
import "./globals.css";
import FarcasterProvider from "./components/FarcasterProvider";
import TermsGate from "./components/TermsGate";
import SplashGate from "./components/SplashGate";

const baseUrl = "https://www.baseappholymarket.xyz";

// v27: Unified Metadata for Absolute Identity (The "Naked Truth" Fix)
// Strictly using Next.js Metadata API to avoid duplicate tags found in crawler checks.
const fcMiniappMetadata = {
  version: "1",
  name: "HolyMarket",
  iconUrl: `${baseUrl}/icon-1024.png`,
  homeUrl: `${baseUrl}/`,
  imageUrl: `${baseUrl}/api/og?v=27`,
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
  title: "HolyMarket",
  applicationName: "HolyMarket",
  description: "HolyMarket: Bet your beliefs on Base.",
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon-1024.png", sizes: "1024x1024", type: "image/png" }
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
        url: "/api/og?v=27",
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
    images: ["/api/og?v=27"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HolyMarket",
  },
  other: {
    "fc:miniapp": JSON.stringify(fcMiniappMetadata),
    "apple-mobile-web-app-capable": "yes",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "HolyMarket",
    "application-name": "HolyMarket",
    "theme-color": "#050b1a"
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

  // v27: Broad bot detection. Including Toshi (Coinbase's legacy name) and Lighthouse.
  const isBot = /bot|crawler|spider|warpcast|farcaster|google|yandex|bing|facebook|twitter|CoinbaseBot|CoinbaseWallet|Toshi|Lighthouse/i.test(userAgent);

  return (
    <html lang="en">
      {/* 
        NO MANUAL <HEAD> TAGS HERE. 
        Next.js Metadata API handles everything correctly to avoid duplicates like "HolyMarketHolyMarket".
      */}
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
