import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const size = parseInt(searchParams.get('s') || '512');

    // Using the existing high-quality background
    // ImageResponse will render this and output a REAL PNG.
    const baseUrl = 'https://www.baseappholymarket.xyz';
    const bgUrl = `${baseUrl}/icon-1024.png`; // Our existing base image

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
        {
            width: size,
            height: size,
        }
    );
}
