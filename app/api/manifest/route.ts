import { NextResponse } from "next/server";

export async function GET() {
    const domain = "baseappholymarket.xyz";
    const baseUrl = `https://${domain}`;
    const officialLogoUrl = `${baseUrl}/icon.png`;

    // Hardcoded correct values for baseappholymarket.xyz to bypass incorrect Vercel Env Vars
    const header = "eyJmaWQiOjEzOTU5NjEsInR5cGUiOiJhdXRoIiwia2V5IjoiMHgzNWU5OEZiQTZmNTAzNEQyNTJhNzczRjM2ZDA1OWFlMUE1NjQwOTgwIn0";
    const payload = "eyJkb21haW4iOiJiYXNlYXBwaG9seW1hcmtldC54eXoifQ";
    const signature = "aJXo93UhDyy7/hJGiamw2jzqKkIN02Mb5fYsayIa8FoG97V+L0MJlVNlduj5M4rSLVO409qM12GjQZU5dFr2DRs=";

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
            imageUrl: officialLogoUrl,
            buttonTitle: "Launch App",
            splashImageUrl: officialLogoUrl,
            splashBackgroundColor: "#020617",
            webhookUrl: `${baseUrl}/api/webhook`,
        },
        miniapp: {
            version: "1",
            name: "HolyMarket",
            iconUrl: officialLogoUrl,
            homeUrl: baseUrl + "/",
            imageUrl: officialLogoUrl,
            buttonTitle: "Launch App",
            splashImageUrl: officialLogoUrl,
            splashBackgroundColor: "#020617",
        },
        // v2 specific manifest fields
        webhookUrl: `${baseUrl}/api/webhook`,
        ogTitle: "HolyMarket",
        ogDescription: "Prediction Market on Base",
        ogImageUrl: officialLogoUrl,
        subtitle: "Trade your beliefs",
        description: "HolyMarket is a decentralized prediction market where you can bet on future events using crypto.",
        screenshotUrls: [officialLogoUrl],
        primaryCategory: "finance",
        tags: ["crypto", "betting", "prediction", "base"],
        tagline: "HolyMarket: Bet on Base",
        herolImageUrl: officialLogoUrl,
        castShareUrl: baseUrl,
    };

    return new NextResponse(JSON.stringify(manifest), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
            "X-Farcaster-Fix": "v12-final-hardcode-v2",
        },
    });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
