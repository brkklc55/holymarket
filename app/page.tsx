import type { Metadata } from 'next';

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
      "fc:frame:manifest": `${baseUrl}/.well-known/farcaster.json`,
      "fc:frame:image:aspect_ratio": "1.91:1",
      "fc:frame:launch_app": JSON.stringify({
        version: "next",
        name: "HolyMarket",
        iconUrl: `${baseUrl}/icon.png`,
        homeUrl: `${baseUrl}`,
        imageUrl: imageUrl,
        button: {
          title: "Play HolyMarket",
          action: {
            type: "launch_frame",
            name: "HolyMarket",
            url: baseUrl,
          }
        },
        splashImageUrl: `${baseUrl}/icon.png`,
        splashBackgroundColor: "#050b1a"
      }),
      "fc:miniapp": JSON.stringify({
        version: "next",
        name: "HolyMarket",
        iconUrl: `${baseUrl}/icon.png`,
        homeUrl: `${baseUrl}`,
        imageUrl: imageUrl,
        button: {
          title: "Play HolyMarket",
          action: {
            type: "launch_frame",
            name: "HolyMarket",
            url: baseUrl,
          }
        },
        splashImageUrl: `${baseUrl}/icon.png`,
        splashBackgroundColor: "#050b1a",
      })
    },
  };
}

export default function Page() {
  return (
    <main className="min-h-screen bg-black">
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">HolyMarket</h1>
        <p className="text-gray-400 mb-8 max-w-md">
          Bet your beliefs on Base. The prediction market for the Farcaster ecosystem.
        </p>
        <div className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold">
          Launch in Base App
        </div>
      </div>
    </main>
  );
}
