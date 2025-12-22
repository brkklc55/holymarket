import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const origin = (() => {
        try {
            return new URL(req.url).origin;
        } catch {
            return undefined;
        }
    })();

    const appUrl = process.env.NEXT_PUBLIC_URL || origin || 'http://localhost:3000';

    const accountAssociationHeader = process.env.FARCASTER_ACCOUNT_ASSOCIATION_HEADER;
    const accountAssociationPayload = process.env.FARCASTER_ACCOUNT_ASSOCIATION_PAYLOAD;
    const accountAssociationSignature = process.env.FARCASTER_ACCOUNT_ASSOCIATION_SIGNATURE;

    const accountAssociation =
        accountAssociationHeader && accountAssociationPayload && accountAssociationSignature
            ? {
                  header: accountAssociationHeader,
                  payload: accountAssociationPayload,
                  signature: accountAssociationSignature,
              }
            : undefined;

    const config = {
        ...(accountAssociation ? { accountAssociation } : {}),
        frame: {
            version: "1",
            name: "HolyMarket",
            iconUrl: `${appUrl}/ihm-beta.png`,
            homeUrl: appUrl,
        }
    };

    return NextResponse.json(config, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Cache-Control": "no-store, max-age=0",
        },
    });
}
