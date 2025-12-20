import { NextResponse } from 'next/server';

export async function GET() {
    const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

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
            iconUrl: `${appUrl}/logo.png`,
            homeUrl: appUrl,
        }
    };

    return NextResponse.json(config, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}
