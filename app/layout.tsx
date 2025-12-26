import type { Metadata, Viewport } from "next";
import "./globals.css";
import FarcasterProvider from "./components/FarcasterProvider";
import TermsGate from "./components/TermsGate";
import SplashGate from "./components/SplashGate";

export const metadata: Metadata = {
  title: "HolyMarket",
  applicationName: "HolyMarket",
  description: "Decentralized prediction markets on Base Sepolia",
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "https://baseappholymarket.xyz"),
  icons: {
    icon: [{ url: "/logo-premium.svg?v=9", sizes: "any" }],
    shortcut: ["/logo-premium.svg?v=9"],
    apple: [{ url: "/logo-premium.svg?v=9", sizes: "180x180", type: "image/svg+xml" }],
  },

  openGraph: {
    title: "HolyMarket",
    description: "Decentralized prediction markets on Base Sepolia",
    url: "/",
    siteName: "HolyMarket",
    images: [
      {
        url: "/logo-premium.svg",
        width: 256,
        height: 256,
        alt: "HolyMarket",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HolyMarket",
    description: "Decentralized prediction markets on Base Sepolia",
    images: ["/logo-premium.svg"],
  },
  manifest: "/manifest.json?v=7",
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
  themeColor: "#020617",
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <FarcasterProvider>
            <SplashGate>
              <TermsGate>{children}</TermsGate>
            </SplashGate>
          </FarcasterProvider>
        </Providers>
      </body>
    </html>
  );
}
