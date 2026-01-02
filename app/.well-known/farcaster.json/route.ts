import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
    const header = process.env.FARCASTER_ACCOUNT_ASSOCIATION_HEADER || "eyJmaWQiOjEzOTU5NjEsInR5cGUiOiJhdXRoIiwia2V5IjoiMHgzNWU5OEZiQTZmNTAzNEQyNTJhNzczRjM2ZDA1OWFlMUE1NjQwOTgwIn0";
    const payload = process.env.FARCASTER_ACCOUNT_ASSOCIATION_PAYLOAD || "eyJkb21haW4iOiJ3d3cuYmFzZWFwcGhvbHltYXJrZXQueHl6In0";
    const signature = process.env.FARCASTER_ACCOUNT_ASSOCIATION_SIGNATURE || "N4Gq/z4JDiZhtJjAwBMFp+CsYLEmYI8yKRbElau4XgNmZ9wS7gHk4xSonkpdIBqCa6NpGI8lmp+nk/m0SkMBnRs=";
    const baseUrl = process.env.NEXT_PUBLIC_MINIAPP_URL || "https://www.baseappholymarket.xyz";

    const manifest = {
        accountAssociation: { header, payload, signature },
        miniapp: {
            version: "1",
            name: "HolyMarket",
            iconUrl: `${baseUrl}/icon-1024.png`,
            homeUrl: `${baseUrl}/`,
            imageUrl: `${baseUrl}/splash-bg.png`,
            buttonTitle: "Play HolyMarket",
            splashImageUrl: `${baseUrl}/splash-bg.png`,
            splashBackgroundColor: "#050b1a",
            subtitle: "HolyMarket",
            description: "HolyMarket: Bet your beliefs on Base.",
            primaryCategory: "finance",
            tags: ["prediction", "market", "base", "finance"],
            heroImageUrl: `${baseUrl}/splash-bg.png`,
            tagline: "Bet your beliefs on Base",
            ogTitle: "HolyMarket",
            ogDescription: "Bet your beliefs on Base. Join the market",
            ogImageUrl: `${baseUrl}/splash-bg.png`,
            noindex: false,
            castShareUrl: `${baseUrl}/`,
            screenshotUrls: [`${baseUrl}/api/og?v=50`],
            webhookUrl: `${baseUrl}/api/farcaster/webhook`
        },
        baseBuilder: { ownerAddress: "0x35e98FbA6f5034D252a773F36D059ae1A5640980" }
    };

    return NextResponse.json(manifest, {
        headers: {
            'Cache-Control': 'public, max-age=0, must-revalidate',
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        }
    });
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
