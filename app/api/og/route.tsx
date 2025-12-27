import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const question = (searchParams.get('question') || 'HolyMarket Prediction').slice(0, 80);
    const choice = searchParams.get('choice') || '';
    const yesPct = searchParams.get('yesPct') || '50';
    const noPct = searchParams.get('noPct') || '50';
    const volume = searchParams.get('volume') || '0.00';

    const isYes = choice === 'YES';
    const choiceColor = isYes ? '#10b981' : '#f43f5e';
    const yesWidth = Math.max(0, Math.min(100, parseInt(yesPct) || 50));
    const noWidth = 100 - yesWidth;

    try {
        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#020617',
                        padding: 60,
                    }}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
                        <div style={{ width: 48, height: 48, backgroundColor: '#3b82f6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 28, fontWeight: 900 }}>H</div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: 'white', marginLeft: 16, display: 'flex' }}>HOLYMARKET</div>
                    </div>

                    {/* Main Content Card */}
                    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a', borderRadius: 24, padding: 48, flex: 1 }}>
                        {/* Question */}
                        <div style={{ fontSize: 42, fontWeight: 800, color: 'white', lineHeight: 1.3, marginBottom: 32, display: 'flex' }}>
                            {question}
                        </div>

                        {/* Choice Badge - only if choice exists */}
                        {choice ? (
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, backgroundColor: '#1e293b', padding: '12px 24px', borderRadius: 12, border: `2px solid ${choiceColor}` }}>
                                <div style={{ fontSize: 14, fontWeight: 900, color: choiceColor, marginRight: 12, display: 'flex' }}>PREDICTION:</div>
                                <div style={{ fontSize: 28, fontWeight: 900, color: 'white', display: 'flex' }}>{choice}</div>
                            </div>
                        ) : null}

                        {/* Stats Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'flex' }}>VOLUME</div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: 'white', display: 'flex' }}>{volume} ETH</div>
                            </div>
                            <div style={{ display: 'flex', fontSize: 20, fontWeight: 900 }}>
                                <span style={{ color: '#10b981', marginRight: 16 }}>{yesPct}% YES</span>
                                <span style={{ color: '#f43f5e' }}>{noPct}% NO</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ display: 'flex', width: '100%', height: 12, backgroundColor: '#1e293b', borderRadius: 6 }}>
                            <div style={{ width: `${yesWidth}%`, height: 12, backgroundColor: '#10b981', borderRadius: '6px 0 0 6px' }} />
                            <div style={{ width: `${noWidth}%`, height: 12, backgroundColor: '#f43f5e', borderRadius: '0 6px 6px 0' }} />
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 24 }}>
                        <div style={{ width: 8, height: 8, backgroundColor: '#3b82f6', borderRadius: 4, marginRight: 12 }} />
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#64748b', display: 'flex' }}>PREDICTIVE ECONOMY ON BASE</div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        console.error('OG Image Error:', e);
        return new Response(`Failed to generate the image: ${e?.message || 'Unknown error'}`, {
            status: 500,
        });
    }
}
