import type { Metadata } from "next";
import "./globals.css";
import FarcasterProvider from "./components/FarcasterProvider";
import TermsGate from "./components/TermsGate";

export const metadata: Metadata = {
  title: "HolyMarket - Prediction Markets",
  description: "Decentralized prediction markets on BNB Testnet",
  icons: {
    icon: "/logo.png",
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
            <TermsGate>{children}</TermsGate>
          </FarcasterProvider>
        </Providers>
      </body>
    </html>
  );
}
