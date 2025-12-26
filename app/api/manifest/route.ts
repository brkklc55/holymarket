import { NextResponse } from "next/server";

export async function GET() {
    const domain = "baseappholymarket.xyz";
    const baseUrl = `https://${domain}`;
    const logoUrl = `${baseUrl}/logo-premium.svg?v=9`;

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
            iconUrl: logoUrl,
            homeUrl: baseUrl + "/",
            imageUrl: logoUrl,
            buttonTitle: "Launch App",
            splashImageUrl: logoUrl,
            splashBackgroundColor: "#020617",
        },
        miniapp: {
            version: "1",
            name: "HolyMarket",
            iconUrl: logoUrl,
            homeUrl: baseUrl + "/",
            imageUrl: logoUrl,
            buttonTitle: "Launch App",
            splashImageUrl: logoUrl,
            splashBackgroundColor: "#020617",
        },
    };

    return new NextResponse(JSON.stringify(manifest), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
            "X-Farcaster-Fix": "v12-final-hardcode",
        },
    });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
