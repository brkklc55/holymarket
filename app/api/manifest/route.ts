import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const host = req.headers.get("host") || "baseappholymarket.xyz";
    const domain = host.includes("www.") ? "baseappholymarket.xyz" : host; // Keep apex domain for payload consistency
    const baseUrl = `https://${host}`;
    const officialLogoUrl = `https://baseappholymarket.xyz/icon.png`;

    // Hardcoded correct values for baseappholymarket.xyz to bypass incorrect Vercel Env Vars
    const header = "eyJmaWQiOjEzOTU5NjEsInR5cGUiOiJhdXRoIiwia2V5IjoiMHgzNWU5OEZiQTZmNTAzNEQyNTJhNzczRjM2ZDA1OWFlMUE1NjQwOTgwIn0";
    const payload = "eyJkb21haW4iOiJiYXNlYXBwaG9seW1hcmtldC54eXoifQ";
    const signature = "aJXo93UhDyy7/hJGiamw2jzqKkIN02Mb5fYsayIa8FoG97V+L0MJlVNlduj5M4rSLVO409qM12GjQZU5dFr2DRs=";

    const webhookUrl = `${baseUrl}/api/farcaster/webhook`;

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
            webhookUrl: webhookUrl,
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
            webhookUrl: webhookUrl,
            description: "HolyMarket is a decentralized prediction market where you can bet on future events using crypto.",
            subtitle: "Trade your beliefs",
            screenshotUrls: [officialLogoUrl],
            primaryCategory: "finance",
            tags: ["crypto", "betting", "prediction", "base"],
        },
        // Root level fields for various Farcaster tool versions
        name: "HolyMarket",
        iconUrl: officialLogoUrl,
        webhookUrl: webhookUrl,
        ogTitle: "HolyMarket",
        ogDescription: "Trade your beliefs on Base",
        ogImageUrl: officialLogoUrl,
        subtitle: "Trade your beliefs",
        description: "HolyMarket is a decentralized prediction market where you can bet on future events using crypto.",
        screenshotUrls: [officialLogoUrl],
        primaryCategory: "finance",
        tags: ["crypto", "betting", "prediction", "base"],
        tagline: "HolyMarket: Bet on Base",
        heroImageUrl: officialLogoUrl,
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
            "X-Farcaster-Fix": "v12-final-cors-v3",
        },
    });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
