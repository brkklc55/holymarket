import type { Metadata, Viewport } from "next";
import "./globals.css";
import FarcasterProvider from "./components/FarcasterProvider";
import TermsGate from "./components/TermsGate";
import SplashGate from "./components/SplashGate";

const defaultUrl = "https://baseappholymarket.xyz";
const baseUrl = (process.env.NEXT_PUBLIC_URL || defaultUrl).replace(/\/?$/, '');

export const metadata: Metadata = {
  title: "HolyMarket v13 | Trade on Base",
  applicationName: "HolyMarket",
  description: "HolyMarket: Trade your beliefs on Base. Decentarlized, Secure, Fast.",
  metadataBase: new URL(baseUrl + '/'),
  icons: {
    icon: [{ url: `${baseUrl}/icon.png?v=13`, sizes: "any" }],
    shortcut: [`${baseUrl}/icon.png?v=13`],
    apple: [{ url: `${baseUrl}/icon.png?v=13`, sizes: "180x180", type: "image/png" }],
  },

  openGraph: {
    title: "HolyMarket v13 | Base Prediction Market",
    description: "HolyMarket: Trade your beliefs on Base. Decentarlized, Secure, Fast.",
    url: "/",
    siteName: "HolyMarket",
    images: [
      {
        url: `${baseUrl}/og.png?v=13`,
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
    title: "HolyMarket v13 | Base Prediction Market",
    description: "HolyMarket: Trade your beliefs on Base. Decentarlized, Secure, Fast.",
    images: [`${baseUrl}/og.png?v=13`],
  },
  manifest: "/manifest.json?v=13",
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
