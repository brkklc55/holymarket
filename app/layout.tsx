import type { Metadata, Viewport } from "next";
import "./globals.css";
import FarcasterProvider from "./components/FarcasterProvider";
import TermsGate from "./components/TermsGate";
import SplashGate from "./components/SplashGate";

const baseUrl = process.env.NEXT_PUBLIC_MINIAPP_URL || "https://www.baseappholymarket.xyz";

// v43: Master Logo Purge (Hard Cache Flush)
const fcMiniappMetadata = {
  version: "1",
  name: "HolyMarket",
  iconUrl: `${baseUrl}/icon-1024.png`,
  homeUrl: `${baseUrl}/`,
  imageUrl: `${baseUrl}/splash-bg.png`,
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
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
  },
  manifest: "/manifest.json",
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
    images: ["/splash-bg.png"]
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

  const isBot = /bot|crawler|spider|google|yandex|bing|slurp|duckduckgo|baiduspider|yacybot|sogou|exabot|facebot|facebookexternalhit|ia_archiver/i.test(userAgent);

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
      </body>
    </html>
  );
}
