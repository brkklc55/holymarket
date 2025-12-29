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
    icon: [{ url: "https://www.baseappholymarket.xyz/favicon.png", sizes: "any" }],
    shortcut: ["https://www.baseappholymarket.xyz/favicon.png"],
    apple: [{ url: "https://www.baseappholymarket.xyz/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "HolyMarket",
    description: "HolyMarket: Bet your beliefs on Base.",
    url: "https://www.baseappholymarket.xyz/",
    siteName: "HolyMarket",
    images: [
      {
        url: "https://www.baseappholymarket.xyz/api/og?v=19",
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
    images: ["https://www.baseappholymarket.xyz/api/og?v=19"],
  },
  manifest: "https://www.baseappholymarket.xyz/manifest.json",
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
    "msapplication-starturl": "https://www.baseappholymarket.xyz/",
    "msapplication-navbutton-color": "#050b1a",
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

  // v19: Explicit bot detection including Coinbase/Base App discovery robots
  const isBot = /bot|crawler|spider|warpcast|farcaster|coinbase|wallet|toshi|googlebot|yandexbot/i.test(userAgent);

  return (
    <html lang="en">
      <head>
        <title>HolyMarket</title>
        <link rel="canonical" href="https://www.baseappholymarket.xyz/" />
        <link rel="icon" href="https://www.baseappholymarket.xyz/favicon.png" />
        <link rel="apple-touch-icon" href="https://www.baseappholymarket.xyz/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
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
