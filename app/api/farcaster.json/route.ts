import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
    const header = process.env.FARCASTER_ACCOUNT_ASSOCIATION_HEADER || "eyJmaWQiOjEzOTU5NjEsInR5cGUiOiJhdXRoIiwia2V5IjoiMHgzNWU5OEZiQTZmNTAzNEQyNTJhNzczRjM2ZDA1OWFlMUE1NjQwOTgwIn0";
    const payload = process.env.FARCASTER_ACCOUNT_ASSOCIATION_PAYLOAD || "eyJkb21haW4iOiJ3d3cuYmFzZWFwcGhvbHltYXJrZXQueHl6In0";
    const signature = process.env.FARCASTER_ACCOUNT_ASSOCIATION_SIGNATURE || "djS2iHgdtIQvBfLZDP0oKhqGCvTUIi2J1sPNDhrjCbdmGpOv/lwQwkL8ND3y3yG0fae6LcNjEo18jBPkMu0h1xs=";
    const baseUrl = process.env.NEXT_PUBLIC_MINIAPP_URL || "https://www.baseappholymarket.xyz";

    return NextResponse.json({
        accountAssociation: { header, payload, signature },
        miniapp: {
            version: "1",
            name: "HolyMarket",
            iconUrl: `${baseUrl}/icon-1024.png`,
            homeUrl: `${baseUrl}/`,
            imageUrl: `${baseUrl}/splash-bg.png`,
            buttonTitle: "Play HolyMarket",
            splashImageUrl: `${baseUrl}/splash-bg.png`,
            subtitle: "HolyMarket",
            description: "HolyMarket: Bet your beliefs on Base.",
            screenshotUrls: [`${baseUrl}/api/og/v47.png`],
            primaryCategory: "finance",
            tags: ["prediction", "market", "base", "finance"],
            heroImageUrl: `${baseUrl}/splash-bg.png`,
            tagline: "Bet your beliefs on Base",
            ogTitle: "HolyMarket",
            ogDescription: "Bet your beliefs on Base. Join the market",
            ogImageUrl: `${baseUrl}/splash-bg.png`,
            noindex: false,
            castShareUrl: `${baseUrl}/`
        },
        baseBuilder: { ownerAddress: "0x35e98FbA6f5034D252a773F36D059ae1A5640980" }
    }, {
        headers: {
            'Cache-Control': 'public, max-age=0, must-revalidate',
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        }
    });
}
