import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_URL;

const frameMetadata: Record<string, string> = {
  'fc:frame': 'vNext',
  'fc:frame:image': 'https://placehold.co/600x400?text=HolyMarket',
  'fc:frame:image:aspect_ratio': '1.91:1',
  ...(baseUrl ? { 'fc:frame:post_url': `${baseUrl}/api/frame` } : {}),
  'fc:frame:button:1': 'Enter HolyMarket',
};

export const metadata: Metadata = {
  title: 'HolyMarket',
  description: 'Prediction Market on Farcaster',
  openGraph: {
    title: 'HolyMarket',
    description: 'Prediction Market on Farcaster',
    images: ['https://placehold.co/600x400?text=HolyMarket'],
  },
  other: {
    ...frameMetadata,
  },
};

import MarketView from "./components/MarketView";

// ... metadata remains the same ...

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-950">
      <div className="w-full max-w-3xl space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black tracking-tighter text-white">
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
