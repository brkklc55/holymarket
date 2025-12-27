import type { Metadata, Viewport } from "next";
import "./globals.css";
import FarcasterProvider from "./components/FarcasterProvider";
import TermsGate from "./components/TermsGate";
import SplashGate from "./components/SplashGate";

const defaultUrl = "https://baseappholymarket.xyz";
const baseUrl = (process.env.NEXT_PUBLIC_URL || defaultUrl).replace(/\/?$/, '');

export const metadata: Metadata = {
  title: "HolyMarket | Prediction Markets",
  applicationName: "HolyMarket",
  description: "Trade your beliefs on Base. Decentralized and secure.",
  metadataBase: new URL(baseUrl + '/'),
  icons: {
    icon: [{ url: `${baseUrl}/icon.png?v=11`, sizes: "any" }],
    shortcut: [`${baseUrl}/icon.png?v=11`],
    apple: [{ url: `${baseUrl}/icon.png?v=11`, sizes: "180x180", type: "image/png" }],
  },

  openGraph: {
    title: "HolyMarket | Base Prediction Market",
    description: "Trade your beliefs on Base. Decentralized and secure.",
    url: "/",
    siteName: "HolyMarket",
    images: [
      {
        url: `${baseUrl}/og.png?v=11`,
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
    title: "HolyMarket | Base Prediction Market",
    description: "Trade your beliefs on Base. Decentralized and secure.",
    images: [`${baseUrl}/og.png?v=11`],
  },
  manifest: "/manifest.json?v=11",
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
