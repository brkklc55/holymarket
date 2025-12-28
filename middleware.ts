import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

    // Mandatory Farcaster Domain Verification & Proxy Link 307 Redirect
    // ONLY for Warpcast/Farcaster bots that need the hosted manifest
    if ((url.pathname === '/.well-known/farcaster.json' || url.pathname === '/farcaster.json') &&
        (userAgent.includes('farcaster') || userAgent.includes('warpcast'))) {
        return NextResponse.redirect(
            'https://api.farcaster.xyz/miniapps/hosted-manifest/019b5be0-bf0c-91b5-c222-59e32c87eb7b',
            { status: 307 }
        );
    }

    // For everyone else (Base App, Coinbase Wallet, Browsers, etc.), serve the local manifest
    return NextResponse.next();
}

export const config = {
    matcher: ['/.well-known/farcaster.json', '/farcaster.json'],
};
