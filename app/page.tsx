import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_URL;
const appOrigin = baseUrl || "";

const frameMetadata: Record<string, string> = {
  'fc:frame': 'vNext',
  ...(appOrigin ? { 'fc:frame:image': `${appOrigin}/logo.png` } : { 'fc:frame:image': '/logo.png' }),
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
    images: appOrigin ? [`${appOrigin}/logo.png`] : ['/logo.png'],
  },
  other: {
    ...frameMetadata,
  },
};

import MarketView from "./components/MarketView";

// ... metadata remains the same ...

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-slate-950">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/logo.png"
              alt="HolyMarket"
              className="w-20 h-20 rounded-2xl border border-slate-800 bg-slate-900/40"
            />
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
