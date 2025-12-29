import type { Metadata } from 'next';
import MarketView from "./components/MarketView";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const baseUrl = "https://www.baseappholymarket.xyz";
  const appOrigin = baseUrl + "/";

  const question = typeof params.question === 'string' ? params.question : undefined;
  const choice = typeof params.choice === 'string' ? params.choice : undefined;
  const yesPct = typeof params.yesPct === 'string' ? params.yesPct : '50';
  const noPct = typeof params.noPct === 'string' ? params.noPct : '50';
  const volume = typeof params.volume === 'string' ? params.volume : '0.00';

  // Base dynamic image URLs providing strict aspect ratios (Portal requirement)
  const staticOgImageUrl = `/api/og?v=23`;
  const staticIconUrl = `/icon-1024.png`;
  let currentImageUrl = staticOgImageUrl;

  if (question) {
    const urlParams = new URLSearchParams();
    urlParams.set('question', question);
    if (choice) urlParams.set('choice', choice);
    urlParams.set('yesPct', yesPct);
    urlParams.set('noPct', noPct);
    urlParams.set('volume', volume);
    urlParams.set('v', '23');
    currentImageUrl = `/api/og?${urlParams.toString()}`;
  }

  const title = question ? `HolyMarket | ${question}` : 'HolyMarket';
  const description = question ? `Will it happen? Predict now on HolyMarket.` : 'HolyMarket: Bet your beliefs on Base.';

  // Build absolute URLs carefully to avoid // issue
  const absoluteIconUrl = `${baseUrl}${staticIconUrl}`;
  const absoluteHomeUrl = `${baseUrl}/`;
  const absoluteImageUrl = currentImageUrl.startsWith('http') ? currentImageUrl : `${baseUrl}${currentImageUrl}`;

  const sharedMetadata = {
    version: "1",
    name: "HolyMarket",
    iconUrl: absoluteIconUrl,
    homeUrl: absoluteHomeUrl,
    imageUrl: absoluteImageUrl,
    button: {
      title: "Play HolyMarket",
      action: {
        type: "launch_frame",
        name: "HolyMarket",
        url: baseUrl,
      }
    },
    splashImageUrl: absoluteIconUrl,
    splashBackgroundColor: "#050b1a",
    subtitle: "HolyMarket",
    description: "HolyMarket: Bet your beliefs on Base. Join the market.",
    screenshotUrls: [absoluteImageUrl],
    primaryCategory: "finance",
    tags: ["prediction", "market", "base", "finance"],
    heroImageUrl: absoluteImageUrl,
    tagline: "Bet your beliefs on Base",
    ogTitle: "HolyMarket",
    ogDescription: "Bet your beliefs on Base. Join the market",
    ogImageUrl: absoluteImageUrl,
    castShareUrl: baseUrl
  };

  return {
    title,
    description,
    robots: 'index, follow',
    openGraph: {
      title,
      description,
      images: [
        {
          url: absoluteImageUrl,
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
      images: [absoluteImageUrl],
    },
    other: {
      "fc:miniapp": JSON.stringify(sharedMetadata),
      "apple-touch-icon": absoluteIconUrl,
      "fc:frame": "vNext",
      "fc:frame:v2": "true",
      "fc:frame:image": absoluteImageUrl,
      "fc:frame:manifest": `${baseUrl}/.well-known/farcaster.json`,
      "fc:frame:image:aspect_ratio": "1.91:1",
      "fc:frame:launch_app": JSON.stringify(sharedMetadata),
    },
  };
}

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 bg-slate-950">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <img src="/icon-1024.png" alt="HolyMarket Logo" className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl shadow-xl" />
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
