import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

    // Specific Warpcast/Farcaster User-Agents for redirect
    const isFarcasterBot = userAgent.includes('farcaster') ||
        userAgent.includes('warpcast') ||
        userAgent.includes('standard'); // Some Farcaster scrapers use this

    if ((url.pathname === '/.well-known/farcaster.json' || url.pathname === '/farcaster.json') && isFarcasterBot) {
        return NextResponse.redirect(
            'https://api.farcaster.xyz/miniapps/hosted-manifest/019b5be0-bf0c-91b5-c222-59e32c87eb7b',
            { status: 307 }
        );
    }

    // Serve local manifest for Base App, Coinbase Wallet, and regular browsers
    return NextResponse.next();
}

export const config = {
    matcher: ['/.well-known/farcaster.json', '/farcaster.json'],
};
