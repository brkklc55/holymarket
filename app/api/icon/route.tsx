import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const s = searchParams.get('s') || '1024';
    const size = parseInt(s);

    // v38: Guaranteed TRUE PNG via Next.js ImageResponse (89-50-4E-47)
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: size * 0.4,
                    background: '#050b1a',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontFamily: 'sans-serif',
                }}
            >
                HM
            </div>
        ),
        {
            width: size,
            height: size,
        }
    );
}
