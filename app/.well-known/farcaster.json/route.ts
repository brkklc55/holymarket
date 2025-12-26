import { NextResponse } from "next/server";

export async function GET() {
    const domain = "baseappholymarket.xyz";
    const baseUrl = `https://${domain}`;
    const logoUrl = `${baseUrl}/logo-premium.svg?v=9`;

    // Use the environment variables from Vercel if available
    const header = process.env.FARCASTER_ACCOUNT_ASSOCIATION_HEADER || "eyJmaWQiOjEzOTU5NjEsInR5cGUiOiJhdXRoIiwia2V5IjoiMHgzNWU5OEZiQTZmNTAzNEQyNTJhNzczRjM2ZDA1OWFlMUE1NjQwOTgwIn0";
    const payload = process.env.FARCASTER_ACCOUNT_ASSOCIATION_PAYLOAD || "eyJkb21haW4iOiJiYXNlYXBwaG9seW1hcmtldC54eXoifQ";
    const signature = process.env.FARCASTER_ACCOUNT_ASSOCIATION_SIGNATURE || "J9BcRA4LwLMsk8a7bebz7lyXp2Fp48c-T3rE61SleO_Wnlduj5M4rSLVO409qM12GjQZU5dFr2DRs-bM0uQfBw";

    const manifest = {
        accountAssociation: {
            header: header,
            payload: payload,
            signature: signature,
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
        },
    });
}

// Ensure this is treated as a dynamic route
export const dynamic = "force-dynamic";
export const revalidate = 0;
