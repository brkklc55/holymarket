import type { Metadata, Viewport } from "next";
import "./globals.css";
import FarcasterProvider from "./components/FarcasterProvider";
import TermsGate from "./components/TermsGate";
import SplashGate from "./components/SplashGate";

const baseUrl = "https://www.baseappholymarket.xyz";

// v38: Scientific Final - Extreme Consistency
const fcMiniappMetadata = {
  version: "1",
  name: "HolyMarket",
  iconUrl: `${baseUrl}/icon-1024.png?v=38`,
  homeUrl: `${baseUrl}/`,
  imageUrl: `${baseUrl}/api/og/v38.png`,
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
      { url: "/favicon.png?v=38", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png?v=38", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png?v=38", sizes: "512x512", type: "image/png" },
      { url: "/icon-1024.png?v=38", sizes: "1024x1024", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png?v=38", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon-precomposed.png?v=38", sizes: "180x180", type: "image/png" }
    ],
  },
  manifest: `${baseUrl}/manifest.json?v=38`, // Using absolute URL to avoid redirect issues
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HolyMarket",
  },
  openGraph: {
    title: "HolyMarket",
    description: "HolyMarket: Bet your beliefs on Base.",
    url: "/",
    siteName: "HolyMarket",
    type: "website",
    images: ["/api/og/v38.png"]
  },
  other: {
    "fc:miniapp": JSON.stringify(fcMiniappMetadata),
    "base:app_id": "6952a8dc4d3a403912ed8525",
    "apple-mobile-web-app-title": "HolyMarket",
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

  // v38: EXTENDED BOT DETECTION (Includes all known Coinbase and Wallet UAs)
  const isBot = /bot|crawler|spider|warpcast|farcaster|google|yandex|bing|facebook|twitter|Coinbase|Toshi|Lighthouse|Mojo|BaseApp|Cipher|TrustWallet|Rainbow|Metamask|OKX|Bybit|Bitget|Phantom|TokenPocket/i.test(userAgent);

  return (
    <html lang="en">
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
