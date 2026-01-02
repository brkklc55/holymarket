import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const size = parseInt(searchParams.get('s') || '512');
    const baseUrl = process.env.NEXT_PUBLIC_MINIAPP_URL || 'https://www.baseappholymarket.xyz';
    const bgUrl = `${baseUrl}/icon.png`; // Using the non-v-indexed one as base if possible, or static

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    backgroundImage: `url(${bgUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: '#050b1a',
                }}
            />
        ),
        { width: size, height: size }
    );
}
