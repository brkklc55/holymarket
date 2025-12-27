import type { Metadata } from 'next';

const baseUrl = (process.env.NEXT_PUBLIC_URL || 'https://baseappholymarket.xyz').replace(/\/?$/, '');
const appOrigin = baseUrl + '/';
const fullShareImageUrl = `${baseUrl}/v20-fix.png`;
const frameImageUrl = `${baseUrl}/v20-fix.png`;

const frameMetadata: Record<string, string> = {
  'fc:frame': 'vNext',
  'fc:frame:image': frameImageUrl,
  'fc:frame:image:aspect_ratio': '1.91:1',
  'fc:frame:post_url': `${baseUrl}/api/frame`,
  'fc:frame:button:1': 'Enter HolyMarket',
};

const manifestUrl = `${baseUrl}/.well-known/farcaster.json?v=20`;

export const metadata: Metadata = {
  title: 'HolyMarket',
  description: 'Trade your beliefs on Base. Decentarlized, Secure, Trustless.',
  openGraph: {
    title: 'HolyMarket',
    description: 'Trade your beliefs on Base. Decentarlized, Secure, Trustless.',
    images: [
      {
        url: frameImageUrl,
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'HolyMarket',
      },
    ],
    url: appOrigin,
    siteName: 'HolyMarket',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HolyMarket',
    description: 'Trade your beliefs on Base. Decentarlized, Secure, Trustless.',
    images: [frameImageUrl],
  },
  other: {
    ...frameMetadata,
    "fc:frame:v2": "true",
    "fc:frame:manifest": manifestUrl,
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: fullShareImageUrl,
      button: {
        title: "Launch App",
        action: {
          type: "launch_frame",
          url: appOrigin,
        },
      },
      splashBackgroundColor: "#020617",
    }),
  },
};

import MarketView from "./components/MarketView";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-slate-950">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <img src="/icon.png" alt="HolyMarket Logo" className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl shadow-xl" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-none break-words">
            HOLY<span className="text-gradient">MARKET</span>
          </h1>
        </div>

        <div className="flex justify-center">
          <MarketView />
        </div>
      </div>
    </main>
  );
}
