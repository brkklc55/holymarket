import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const question = searchParams.get('question') || "Will Base reach 10B TVL?";
    const yes = searchParams.get('yes') || "50";
    const no = searchParams.get('no') || "50";

    try {
        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#020617',
                        color: 'white',
                        padding: '40px',
                        border: '2px solid #334155',
                    }}
                >
                    <div style={{ display: 'flex', fontSize: 60, fontWeight: 'bold', marginBottom: 40, textAlign: 'center' }}>
                        {question}
                    </div>
                    <div style={{ display: 'flex', gap: 40 }}>
                        <div style={{ display: 'flex', backgroundColor: '#22c55e', padding: '20px 40px', borderRadius: 12, fontSize: 32 }}>
                            YES: {yes}%
                        </div>
                        <div style={{ display: 'flex', backgroundColor: '#ef4444', padding: '20px 40px', borderRadius: 12, fontSize: 32 }}>
                            NO: {no}%
                        </div>
                    </div>
                    <div style={{ marginTop: 40, fontSize: 24, color: '#94a3b8' }}>
                        HolyMarket • Predict the Future
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
