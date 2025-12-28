import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();

    // Mandatory Farcaster Domain Verification 307 Redirect
    if (url.pathname === '/.well-known/farcaster.json' || url.pathname === '/farcaster.json') {
        return NextResponse.redirect(
            'https://api.farcaster.xyz/miniapps/hosted-manifest/019b5be0-bf0c-91b5-c222-59e32c87eb7b',
            { status: 307 }
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/.well-known/farcaster.json', '/farcaster.json'],
};
