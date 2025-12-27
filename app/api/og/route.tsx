import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const question = searchParams.get('question') || "HolyMarket";
    const sub = searchParams.get('sub') || "Base Prediction Market";

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
                        border: '8px solid #334155',
                        backgroundImage: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)',
                    }}
                >
                    <div style={{ display: 'flex', fontSize: 120, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', letterSpacing: '-0.05em' }}>
                        {question}
                    </div>
                    <div style={{ display: 'flex', fontSize: 48, color: '#94a3b8', marginBottom: 60 }}>
                        {sub}
                    </div>
                    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                        <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#22c55e' }} />
                        <div style={{ fontSize: 24, color: '#22c55e', fontWeight: 'bold' }}>LIVE ON BASE</div>
                    </div>
                    <div style={{ marginTop: 40, fontSize: 24, color: '#94a3b8', display: 'flex' }}>
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
