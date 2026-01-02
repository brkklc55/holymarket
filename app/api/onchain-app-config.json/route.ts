import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_MINIAPP_URL || "https://www.baseappholymarket.xyz";

    return NextResponse.json({
        "name": "HolyMarket",
        "description": "HolyMarket: Bet your beliefs on Base.",
        "iconUrl": `${baseUrl}/icon-1024.png`,
        "launchUrl": `${baseUrl}/`,
        "contracts": []
    }, {
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
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
