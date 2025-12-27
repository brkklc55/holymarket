import type { Metadata } from 'next';

const baseUrl = (process.env.NEXT_PUBLIC_URL || 'https://baseappholymarket.xyz').replace(/\/?$/, '');
const appOrigin = baseUrl + '/';

export async function generateMetadata({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }): Promise<Metadata> {
  const question = typeof searchParams.question === 'string' ? searchParams.question : undefined;
  const choice = typeof searchParams.choice === 'string' ? searchParams.choice : undefined;
  const yesPct = typeof searchParams.yesPct === 'string' ? searchParams.yesPct : '50';
  const noPct = typeof searchParams.noPct === 'string' ? searchParams.noPct : '50';
  const volume = typeof searchParams.volume === 'string' ? searchParams.volume : '0.00';

  let imageUrl = `${baseUrl}/og.png`;
  if (question) {
    const params = new URLSearchParams();
    params.set('question', question);
    if (choice) params.set('choice', choice);
    params.set('yesPct', yesPct);
    params.set('noPct', noPct);
    params.set('volume', volume);
    imageUrl = `${baseUrl}/api/og?${params.toString()}`;
  }

  const manifestUrl = `${baseUrl}/farcaster.json`;

  return {
    title: 'HolyMarket',
    description: 'HolyMarket: Bet your beliefs on Base.',
    openGraph: {
      title: 'HolyMarket',
      description: 'HolyMarket: Bet your beliefs on Base.',
      images: [
        {
          url: imageUrl,
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
      description: 'HolyMarket: Bet your beliefs on Base.',
      images: [imageUrl],
    },
    other: {
      "fc:frame": "vNext",
      "fc:frame:image": imageUrl,
      "fc:frame:v2": "true",
      "fc:frame:manifest": manifestUrl,
    },
  };
}

import MarketView from "./components/MarketView";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-12 pb-20 px-4 sm:px-6 bg-[#020617] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />

      <div className="w-full max-w-2xl space-y-10 relative z-10">
        <div className="text-center space-y-6 animate-fade-in-up">
          <div className="flex justify-center">
            <div className="p-1 rounded-[2.5rem] bg-gradient-to-b from-blue-500/20 to-transparent">
              <img
                src="/icon.png"
                alt="HolyMarket Logo"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] shadow-2xl transition-transform hover:scale-105 duration-300"
              />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white m-0">
              HOLY<span className="text-gradient">MARKET</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base font-medium uppercase tracking-[0.2em]">
              Bet Your Beliefs
            </p>
          </div>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <MarketView />
        </div>
      </div>
    </main>
  );
}
