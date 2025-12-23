import type { Metadata } from "next";
import "./globals.css";
import FarcasterProvider from "./components/FarcasterProvider";
import TermsGate from "./components/TermsGate";
import SplashGate from "./components/SplashGate";

export const metadata: Metadata = {
  title: "HolyMarket",
  applicationName: "HolyMarket",
  description: "Decentralized prediction markets on Base Sepolia",
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "https://holymarket.vercel.app"),
  icons: {
    icon: "/ihm-beta.png",
  },
  appleWebApp: {
    title: "HolyMarket",
  },
  openGraph: {
    title: "HolyMarket",
    description: "Decentralized prediction markets on Base Sepolia",
    url: "/",
    siteName: "HolyMarket",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "HolyMarket",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HolyMarket",
    description: "Decentralized prediction markets on Base Sepolia",
    images: ["/logo.png"],
  },
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
