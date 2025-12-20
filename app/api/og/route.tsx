import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const question = searchParams.get('question') || 'Prediction Market';
    const yes = searchParams.get('yes') || '50';
    const no = searchParams.get('no') || '50';

    return new ImageResponse(
        (
            <div
                style={{
                    display: 'flex',
                    height: '100%',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    backgroundImage: 'linear-gradient(to bottom, #f0f9ff, #e0f2fe)',
                    fontSize: 60,
                    letterSpacing: -2,
                    fontWeight: 700,
                    textAlign: 'center',
                    color: '#0f172a',
                }}
            >
                <div style={{ marginBottom: 40, padding: '0 40px' }}>{question}</div>
                <div style={{ display: 'flex', gap: '60px' }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        backgroundColor: '#dcfce7',
                        padding: '20px 40px',
                        borderRadius: '20px',
                        border: '4px solid #16a34a',
                        color: '#16a34a'
                    }}>
                        <span style={{ fontSize: 40 }}>YES</span>
                        <span>{yes}%</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        backgroundColor: '#fee2e2',
                        padding: '20px 40px',
                        borderRadius: '20px',
                        border: '4px solid #dc2626',
                        color: '#dc2626'
                    }}>
                        <span style={{ fontSize: 40 }}>NO</span>
                        <span>{no}%</span>
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        },
    );
}
