import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const question = searchParams.get('question') || "HolyMarket Prediction";
    const choice = searchParams.get('choice'); // 'YES' or 'NO'
    const yesPct = searchParams.get('yesPct') || '50';
    const noPct = searchParams.get('noPct') || '50';
    const volume = searchParams.get('volume') || '0.00';

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
                        padding: '60px',
                        fontFamily: 'sans-serif',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Background Glows */}
                    <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, backgroundColor: '#3b82f610', borderRadius: '50%', filter: 'blur(80px)' }} />
                    <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, backgroundColor: '#10b98108', borderRadius: '50%', filter: 'blur(80px)' }} />

                    {/* Logo Area */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
                        <div style={{ width: 40, height: 40, backgroundColor: '#3b82f6', borderRadius: 12, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 'black' }}>H</div>
                        <div style={{ fontSize: 28, fontWeight: 900, color: 'white', letterSpacing: '-0.02em', display: 'flex' }}>
                            HOLY<span style={{ color: '#3b82f6' }}>MARKET</span>
                        </div>
                    </div>

                    {/* Question Card */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#0f172a',
                        borderRadius: 40,
                        border: '1px solid #1e293b',
                        padding: '48px',
                        width: '100%',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        position: 'relative'
                    }}>
                        <div style={{ fontSize: 44, fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 40, textAlign: 'left' }}>
                            {question}
                        </div>

                        {/* Choice Highlight */}
                        {choice && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                                marginBottom: 40,
                                backgroundColor: choice === 'YES' ? '#10b98115' : '#f43f5e15',
                                padding: '16px 32px',
                                borderRadius: 20,
                                border: `1px solid ${choice === 'YES' ? '#10b98130' : '#f43f5e30'}`,
                                alignSelf: 'flex-start'
                            }}>
                                <div style={{ fontSize: 14, fontWeight: 900, color: choice === 'YES' ? '#10b981' : '#f43f5e', letterSpacing: '0.2em' }}>PREDICTION</div>
                                <div style={{ fontSize: 24, fontWeight: 900, color: 'white' }}>{choice}</div>
                            </div>
                        )}

                        {/* Stats Bar */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontSize: 12, fontWeight: 900, color: '#64748b', letterSpacing: '0.1em', marginBottom: 4 }}>VOLUME</div>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: 'white' }}>{volume} <span style={{ fontSize: 14, color: '#64748b' }}>ETH</span></div>
                                </div>
                                <div style={{ display: 'flex', gap: 20, fontSize: 18, fontWeight: 900 }}>
                                    <span style={{ color: '#10b981' }}>{yesPct}% YES</span>
                                    <span style={{ color: '#64748b' }}>/</span>
                                    <span style={{ color: '#f43f5e' }}>{noPct}% NO</span>
                                </div>
                            </div>

                            {/* Visual Bar */}
                            <div style={{ display: 'flex', width: '100%', height: 12, backgroundColor: '#1e293b', borderRadius: 6, overflow: 'hidden' }}>
                                <div style={{ width: `${yesPct}%`, height: '100%', backgroundColor: '#10b981' }} />
                                <div style={{ width: `${noPct}%`, height: '100%', backgroundColor: '#f43f5e' }} />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 8, height: 8, backgroundColor: '#3b82f6', borderRadius: 4 }} />
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>LIVE PREDICTIVE ECONOMY ON BASE</div>
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
