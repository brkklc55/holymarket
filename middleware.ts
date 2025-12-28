import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // No redirects for farcaster.json to allow portal to read our local, enriched manifest.
    // Ownership is handled via the accountAssociation signature inside the file.
    return NextResponse.next();
}

export const config = {
    matcher: ['/.well-known/farcaster.json', '/farcaster.json'],
};
