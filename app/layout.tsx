import type { Metadata, Viewport } from "next";
import "./globals.css";
import FarcasterProvider from "./components/FarcasterProvider";
import TermsGate from "./components/TermsGate";
import SplashGate from "./components/SplashGate";

const baseUrl = "https://www.baseappholymarket.xyz";

// v35: Deep Identity & Service Worker (Registry Fix)
const fcMiniappMetadata = {
  version: "1",
  name: "HolyMarket",
  iconUrl: `${baseUrl}/icon-1024.png?v=35`,
  homeUrl: `${baseUrl}/`,
  imageUrl: `${baseUrl}/api/og/v35.png`,
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

  // v35: Highly inclusive bot/wallet detection
  const isBot = /bot|crawler|spider|warpcast|farcaster|google|yandex|bing|facebook|twitter|Coinbase|Toshi|Lighthouse|Mojo/i.test(userAgent);

  return (
    <html lang="en">
      <head>
        {/* v35: PWA CORE IDENTITY (The absolute top) */}
        <meta charSet="utf-8" />
        <title>HolyMarket</title>
        <meta name="apple-mobile-web-app-title" content="HolyMarket" />
        <meta name="application-name" content="HolyMarket" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Strict Absolute Asset Mapping (v35 Cache Buster) */}
        <link rel="manifest" href={`${baseUrl}/manifest.json?v=35`} />
        <link rel="apple-touch-icon" href={`${baseUrl}/apple-touch-icon.png?v=35`} />
        <link rel="shortcut icon" href={`${baseUrl}/favicon.png?v=35`} />

        {/* Registry & Verification */}
        <meta name="fc:miniapp" content={JSON.stringify(fcMiniappMetadata)} />
        <meta name="base:app_id" content="6952a8dc4d3a403912ed8525" />
        <meta name="theme-color" content="#050b1a" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
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
