import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    const baseUrl = 'https://www.baseappholymarket.xyz';
    const iconUrl = `${baseUrl}/hm_icon_v12.png`;

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#050b1a',
                }}
            >
                <img
                    src={iconUrl}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '25%',
                    }}
                />
            </div>
        ),
        {
            width: 512,
            height: 512,
        }
    );
}
