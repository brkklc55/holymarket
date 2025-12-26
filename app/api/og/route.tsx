import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    const appOrigin = "https://baseappholymarket.xyz";
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
                    backgroundColor: '#020617',
                    backgroundImage: 'radial-gradient(circle at 50% 0%, #38bdf820 0%, transparent 50%)',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img
                        src={`${appOrigin}/icon.png`}
                        width="160"
                        height="160"
                        style={{ marginBottom: 40, borderRadius: 40 }}
                    />
                    <div style={{
                        display: 'flex',
                        fontSize: 80,
                        fontWeight: 900,
                        letterSpacing: '-0.05em',
                        color: 'white',
                        lineHeight: 1,
                    }}>
                        HOLY<span style={{ color: '#38bdf8' }}>MARKET</span>
                    </div>
                    <div style={{
                        fontSize: 30,
                        color: '#94a3b8',
                        marginTop: 20,
                        fontWeight: 500,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                    }}>
                        Prediction Markets on Base
                    </div>
                </div>

                <div style={{ display: 'flex', marginTop: 60, gap: '40px' }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                        padding: '20px 50px',
                        borderRadius: '24px',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                    }}>
                        <div style={{ fontSize: 24, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 5 }}>Yes</div>
                        <div style={{ fontSize: 48, fontWeight: 700, color: '#22c55e' }}>{yes}%</div>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        backgroundColor: 'rgba(30, 41, 59, 0.5)',
                        padding: '20px 50px',
                        borderRadius: '24px',
                        border: '1px solid rgba(244, 63, 94, 0.2)',
                    }}>
                        <div style={{ fontSize: 24, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 5 }}>No</div>
                        <div style={{ fontSize: 48, fontWeight: 700, color: '#f43f5e' }}>{no}%</div>
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
