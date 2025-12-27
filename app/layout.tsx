import type { Metadata, Viewport } from "next";
import "./globals.css";
import FarcasterProvider from "./components/FarcasterProvider";
import TermsGate from "./components/TermsGate";
import SplashGate from "./components/SplashGate";

const defaultUrl = "https://baseappholymarket.xyz";
const baseUrl = (process.env.NEXT_PUBLIC_URL || defaultUrl).replace(/\/?$/, '');

export const metadata: Metadata = {
  title: "HolyMarket",
  applicationName: "HolyMarket",
  description: "HolyMarket: Trade your beliefs on Base. Decentarlized, Secure, Trustless.",
  metadataBase: new URL(baseUrl + '/'),
  icons: {
    icon: [{ url: `${baseUrl}/icon.png`, sizes: "any" }],
    shortcut: [`${baseUrl}/icon.png`],
    apple: [{ url: `${baseUrl}/icon.png`, sizes: "180x180", type: "image/png" }],
  },

  openGraph: {
    title: "HolyMarket",
    description: "HolyMarket: Trade your beliefs on Base. Decentarlized, Secure, Trustless.",
    url: "/",
    siteName: "HolyMarket",
    images: [
      {
        url: `${baseUrl}/holy-v24.png`,
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
    description: "HolyMarket: Trade your beliefs on Base. Decentarlized, Secure, Trustless.",
    images: [`${baseUrl}/holy-v24.png`],
  },
  manifest: "/manifest.json?v=24",
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
