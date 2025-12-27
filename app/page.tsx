
import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://baseappholymarket.xyz';
const appOrigin = baseUrl;
const fullShareImageUrl = `https://placehold.co/1200x800/020617/white?text=HolyMarket+MiniApp+3:2`; // 3:2
const frameImageUrl = `https://placehold.co/1200x630/020617/white?text=HolyMarket+Frame+1.91:1`; // 1.91:1

const frameMetadata: Record<string, string> = {
  'fc:frame': 'vNext',
  'fc:frame:image': frameImageUrl,
  'fc:frame:image:aspect_ratio': '1.91:1',
  'fc:frame:post_url': `${appOrigin}/api/frame`,
  'fc:frame:button:1': 'Enter HolyMarket',
};

const manifestUrl = `${appOrigin}/api/manifest`;

export const metadata: Metadata = {
  title: 'HolyMarket',
  description: 'HolyMarket: The first decentralized prediction market on Base. Trade your beliefs.',
  openGraph: {
    title: 'HolyMarket',
    description: 'HolyMarket: The first decentralized prediction market on Base. Trade your beliefs.',
    images: [
      {
        url: frameImageUrl,
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: 'HolyMarket Preview',
      },
    ],
    url: appOrigin,
    siteName: 'HolyMarket',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HolyMarket',
    description: 'HolyMarket: The first decentralized prediction market on Base. Trade your beliefs.',
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
