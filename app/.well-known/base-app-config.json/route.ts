import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
    const config = {
        "allowedOrigins": [
            "https://baseappholymarket.xyz",
            "https://www.baseappholymarket.xyz"
        ]
    };

    return NextResponse.json(config, {
        headers: {
            'Cache-Control': 'public, max-age=0, must-revalidate',
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        }
    });
}
