import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const question = (searchParams.get('question') || "HolyMarket Prediction").slice(0, 100);
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
                        position: 'relative',
                    }}
                >
                    {/* Background decoration - Using solid opacity instead of blur */}
                    <div style={{ position: 'absolute', top: -100, right: -100, width: 600, height: 600, backgroundColor: '#3b82f6', opacity: 0.1, borderRadius: 300 }} />

                    {/* Logo Area */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 60 }}>
                        <div style={{ width: 48, height: 48, backgroundColor: '#3b82f6', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 32, fontWeight: 900 }}>H</div>
                        <div style={{ fontSize: 36, fontWeight: 900, color: 'white', marginLeft: 16 }}>
                            HOLY<span style={{ color: '#3b82f6' }}>MARKET</span>
                        </div>
                    </div>

                    {/* Question Card */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#0f172a',
                        borderRadius: 40,
                        border: '2px solid #1e293b',
                        padding: '60px',
                        width: '100%',
                    }}>
                        <div style={{ fontSize: 44, fontWeight: 800, color: 'white', lineHeight: 1.3, marginBottom: 40 }}>
                            {question}
                        </div>

                        {/* Choice Highlight */}
                        {choice && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: 40,
                                backgroundColor: choice === 'YES' ? '#10b98120' : '#f43f5e20',
                                padding: '16px 32px',
                                borderRadius: 20,
                                border: `2px solid ${choice === 'YES' ? '#10b98150' : '#f43f5e50'}`,
                                alignSelf: 'flex-start'
                            }}>
                                <div style={{ fontSize: 16, fontWeight: 900, color: choice === 'YES' ? '#10b981' : '#f43f5e', letterSpacing: '2px', marginRight: 16 }}>PREDICTION</div>
                                <div style={{ fontSize: 32, fontWeight: 900, color: 'white' }}>{choice}</div>
                            </div>
                        )}

                        {/* Stats Bar */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontSize: 14, fontWeight: 900, color: '#64748b', letterSpacing: '1px', marginBottom: 4 }}>VOLUME</div>
                                    <div style={{ fontSize: 32, fontWeight: 800, color: 'white' }}>{volume} <span style={{ fontSize: 18, color: '#64748b' }}>ETH</span></div>
                                </div>
                                <div style={{ display: 'flex', fontSize: 24, fontWeight: 900 }}>
                                    <span style={{ color: '#10b981', marginRight: 20 }}>{yesPct}% YES</span>
                                    <span style={{ color: '#f43f5e' }}>{noPct}% NO</span>
                                </div>
                            </div>

                            {/* Visual Bar */}
                            <div style={{ display: 'flex', width: '100%', height: 16, backgroundColor: '#1e293b', borderRadius: 8, overflow: 'hidden' }}>
                                <div style={{ width: `${yesPct}%`, height: '100%', backgroundColor: '#10b981' }} />
                                <div style={{ width: `${noPct}%`, height: '100%', backgroundColor: '#f43f5e' }} />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: 60, display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: 10, height: 10, backgroundColor: '#3b82f6', borderRadius: 5, marginRight: 16 }} />
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#64748b', letterSpacing: '1px' }}>PREDICTIVE ECONOMY ON BASE</div>
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
