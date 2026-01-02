import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_MINIAPP_URL || "https://www.baseappholymarket.xyz";

    return NextResponse.json({
        "name": "HolyMarket",
        "short_name": "HolyMarket",
        "description": "HolyMarket: Bet your beliefs on Base.",
        "start_url": ".",
        "display": "standalone",
        "background_color": "#050b1a",
        "theme_color": "#050b1a",
        "orientation": "portrait",
        "icons": [
            { "src": "/favicon.png", "sizes": "32x32", "type": "image/png" },
            { "src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" },
            { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
            { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
            { "src": "/icon-1024.png", "sizes": "1024x1024", "type": "image/png" }
        ]
    }, {
        headers: {
            'Cache-Control': 'public, max-age=0, must-revalidate',
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/manifest+json'
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
