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
  description: "HolyMarket: Trade your beliefs on Base. Secure and Trustless.",
  metadataBase: new URL(baseUrl + '/'),
  icons: {
    icon: [{ url: `${baseUrl}/icon.png`, sizes: "any" }],
    shortcut: [`${baseUrl}/icon.png`],
    apple: [{ url: `${baseUrl}/icon.png`, sizes: "180x180", type: "image/png" }],
  },

  openGraph: {
    title: "HolyMarket",
    description: "HolyMarket: Trade your beliefs on Base. Secure and Trustless.",
    url: "/",
    siteName: "HolyMarket",
    images: [
      {
        url: `${baseUrl}/v23-pırlanta.png`,
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
    description: "HolyMarket: Trade your beliefs on Base. Secure and Trustless.",
    images: [`${baseUrl}/v23-pırlanta.png`],
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
