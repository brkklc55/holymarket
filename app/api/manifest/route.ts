import { NextResponse } from "next/server";

export async function GET() {
    const domain = "baseappholymarket.xyz";
    const baseUrl = `https://${domain}/`;
    const officialLogoUrl = `${baseUrl}icon.png?v=9`;
    const webhookUrl = `${baseUrl}api/farcaster/webhook`;

    // Hardcoded correct values for baseappholymarket.xyz to bypass incorrect Vercel Env Vars
    const header = "eyJmaWQiOjEzOTU5NjEsInR5cGUiOiJhdXRoIiwia2V5IjoiMHgzNWU5OEZiQTZmNTAzNEQyNTJhNzczRjM2ZDA1OWFlMUE1NjQwOTgwIn0";
    const payload = "eyJkb21haW4iOiJiYXNlYXBwaG9seW1hcmtldC54eXoifQ";
    const signature = "aJXo93UhDyy7/hJGiamw2jzqKkIN02Mb5fYsayIa8FoG97V+L0MJlVNlduj5M4rSLVO409qM12GjQZU5dFr2DRs=";

    const appDescription = "The first decentralized prediction market on Base. Trade your beliefs.";
    const appSubtitle = "Trade your beliefs on Base";

    const manifest = {
        accountAssociation: {
            header,
            payload,
            signature,
        },
        frame: {
            version: "1",
            name: "HolyMarket",
            iconUrl: officialLogoUrl,
            homeUrl: baseUrl + "/",
            imageUrl: `${baseUrl}/og.png?v=9`,
            buttonTitle: "Launch App",
            webhookUrl: webhookUrl,
            description: appDescription,
            subtitle: appSubtitle,
            screenshotUrls: [officialLogoUrl],
            primaryCategory: "finance",
            tags: ["crypto", "betting", "prediction", "base"],
            heroImageUrl: `${baseUrl}/embed.png?v=9`,
        },
        miniapp: {
            version: "1",
            name: "HolyMarket",
            iconUrl: officialLogoUrl,
            homeUrl: baseUrl + "/",
            imageUrl: `${baseUrl}/embed.png?v=9`,
            buttonTitle: "Launch App",
            webhookUrl: webhookUrl,
            description: appDescription,
            subtitle: appSubtitle,
            screenshotUrls: [officialLogoUrl],
            primaryCategory: "finance",
            tags: ["crypto", "betting", "prediction", "base"],
            heroImageUrl: `${baseUrl}/embed.png?v=9`,
        },
        // Root level fields for various Farcaster tool versions
        name: "HolyMarket",
        iconUrl: officialLogoUrl,
        webhookUrl: webhookUrl,
        ogTitle: "HolyMarket",
        ogDescription: "Trade your beliefs on Base",
        ogImageUrl: `${baseUrl}/og.png?v=9`,
        oglImageUrl: `${baseUrl}/og.png?v=9`,
        subtitle: appSubtitle,
        description: appDescription,
        screenshotUrls: [officialLogoUrl],
        primaryCategory: "finance",
        tags: ["crypto", "betting", "prediction", "base"],
        tagline: "HolyMarket: Bet on Base",
        heroImageUrl: `${baseUrl}/embed.png?v=9`,
        castShareUrl: baseUrl,
    };

    return new NextResponse(JSON.stringify(manifest), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
            "X-Farcaster-Fix": "v13-og-fix",
        },
    });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
