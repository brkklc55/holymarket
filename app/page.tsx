import type { Metadata } from 'next';

const baseUrl = (process.env.NEXT_PUBLIC_URL || 'https://baseappholymarket.xyz').replace(/\/?$/, '');
const appOrigin = baseUrl + '/';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;

  const question = typeof params.question === 'string' ? params.question : undefined;
  const choice = typeof params.choice === 'string' ? params.choice : undefined;
  const yesPct = typeof params.yesPct === 'string' ? params.yesPct : '50';
  const noPct = typeof params.noPct === 'string' ? params.noPct : '50';
  const volume = typeof params.volume === 'string' ? params.volume : '0.00';

  let imageUrl = `${baseUrl}/og.png`;
  if (question) {
    const urlParams = new URLSearchParams();
    urlParams.set('question', question);
    if (choice) urlParams.set('choice', choice);
    urlParams.set('yesPct', yesPct);
    urlParams.set('noPct', noPct);
    urlParams.set('volume', volume);
    imageUrl = `${baseUrl}/api/og?${urlParams.toString()}`;
  }

  const manifestUrl = `${baseUrl}/.well-known/farcaster.json`;

  const title = question ? `HolyMarket | ${question}` : 'HolyMarket';
  const description = question ? `Will it happen? Predict now on HolyMarket.` : 'HolyMarket: Bet your beliefs on Base.';

  return {
    title,
    description,
    robots: 'index, follow',
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          type: 'image/png',
          alt: title,
        },
      ],
      url: appOrigin,
      siteName: 'HolyMarket',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    other: {
      "apple-touch-icon": `${baseUrl}/icon.png`,
      "fc:frame": "vNext",
      "fc:frame:v2": "true",
      "fc:frame:image": imageUrl,
      "fc:frame:manifest": manifestUrl,
      "fc:frame:image:aspect_ratio": "1.91:1",
      "fc:frame:launch_app": JSON.stringify({
        version: "1",
        name: "HolyMarket",
        iconUrl: `${baseUrl}/icon.png`,
        buttonTitle: "Play HolyMarket",
        homeUrl: `${baseUrl}`,
        imageUrl: imageUrl,
        splashImageUrl: `${baseUrl}/icon.png`,
        splashBackgroundColor: "#050b1a"
      }),
      "fc:miniapp": JSON.stringify({
        version: "1",
        name: "HolyMarket",
        iconUrl: `${baseUrl}/icon.png`,
        homeUrl: `${baseUrl}`,
        imageUrl: imageUrl,
        buttonTitle: "Play HolyMarket",
        splashImageUrl: `${baseUrl}/icon.png`,
        splashBackgroundColor: "#050b1a",
      })
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
