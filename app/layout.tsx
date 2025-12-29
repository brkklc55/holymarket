import type { Metadata, Viewport } from "next";
import "./globals.css";
import FarcasterProvider from "./components/FarcasterProvider";
import TermsGate from "./components/TermsGate";
import SplashGate from "./components/SplashGate";

const baseUrl = process.env.NEXT_PUBLIC_MINIAPP_URL || "https://www.baseappholymarket.xyz";

export const metadata: Metadata = {
  title: "HolyMarket",
  description: "HolyMarket: Bet your beliefs on Base.",
  metadataBase: new URL(baseUrl),
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HolyMarket",
  },
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
  const isBot = /bot|crawler|spider|warpcast|farcaster|google|facebook|twitter|Coinbase/i.test(userAgent);

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
