
import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_URL;
const appOrigin = baseUrl || "";
const shareImagePath = "/api/og";

const frameMetadata: Record<string, string> = {
  'fc:frame': 'vNext',
  'fc:frame:image': appOrigin ? `${appOrigin}${shareImagePath}` : `https://baseappholymarket.xyz${shareImagePath}`,
  'fc:frame:image:aspect_ratio': '1.91:1',
  ...(baseUrl ? { 'fc:frame:post_url': `${baseUrl}/api/frame` } : {}),
  'fc:frame:button:1': 'Enter HolyMarket',
};

const manifestUrl = `https://baseappholymarket.xyz/api/manifest`;

export const metadata: Metadata = {
  title: 'HolyMarket',
  description: 'Prediction Market on Farcaster',
  openGraph: {
    title: 'HolyMarket',
    description: 'Prediction Market on Farcaster',
    images: appOrigin ? [`${appOrigin}${shareImagePath}`] : [shareImagePath],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HolyMarket',
    description: 'Prediction Market on Farcaster',
    images: appOrigin ? [`${appOrigin}${shareImagePath}`] : [shareImagePath],
  },
  other: {
    ...frameMetadata,
    "fc:frame:v2": "true",
    "fc:frame:manifest": manifestUrl,
  },
};

import MarketView from "./components/MarketView";

// ... metadata remains the same ...

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
