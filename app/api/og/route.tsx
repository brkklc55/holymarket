import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const question = (searchParams.get('question') || '').slice(0, 80);
    const choice = searchParams.get('choice') || '';
    const yesPct = searchParams.get('yesPct') || '50';
    const noPct = searchParams.get('noPct') || '50';
    const volume = searchParams.get('volume') || '0.00';

    // Check if it's a static request (no question)
    const isStatic = !question;
    const baseUrl = 'https://www.baseappholymarket.xyz';
    const premiumImageUrl = `${baseUrl}/og_premium.png`;

    try {
        // Mode 1: Premium Static Image (for Portal and Initial Share)
        if (isStatic) {
            return new ImageResponse(
                (
                    <div
                        style={{
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            backgroundImage: `url(${premiumImageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundColor: '#020617',
                        }}
                    />
                ),
                {
                    width: 1200,
                    height: 630,
                }
            );
        }

        // Mode 2: Dynamic Question Card
        const isYes = choice?.toUpperCase() === 'YES';
        const choiceColor = isYes ? '#10b981' : '#f43f5e';
        const yesWidth = Math.max(5, Math.min(95, parseInt(yesPct) || 50));
        const noWidth = 100 - yesWidth;

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
                        fontFamily: 'sans-serif',
                        backgroundImage: `url(${premiumImageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    {/* Dark Overlay to make text readable on background */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(2, 6, 23, 0.85)', display: 'flex' }} />

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40, position: 'relative' }}>
                        <div style={{ width: 48, height: 48, backgroundColor: '#3b82f6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 28, fontWeight: 900 }}>H</div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: 'white', marginLeft: 16, display: 'flex' }}>HOLYMARKET</div>
                    </div>

                    {/* Main Content Card */}
                    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: 24, padding: 48, flex: 1, border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                        {/* Question */}
                        <div style={{ fontSize: 44, fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 32, display: 'flex' }}>
                            {question}
                        </div>

                        {/* Choice Badge - only if choice exists */}
                        {choice ? (
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, backgroundColor: 'rgba(30, 41, 59, 1)', padding: '12px 24px', borderRadius: 16, border: `2px solid ${choiceColor}` }}>
                                <div style={{ fontSize: 16, fontWeight: 900, color: choiceColor, marginRight: 12, display: 'flex', letterSpacing: '0.05em' }}>PREDICTION:</div>
                                <div style={{ fontSize: 32, fontWeight: 900, color: 'white', display: 'flex' }}>{choice.toUpperCase()}</div>
                            </div>
                        ) : null}

                        {/* Stats Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', marginBottom: 8, display: 'flex', letterSpacing: '0.1em' }}>VOLUME</div>
                                <div style={{ fontSize: 32, fontWeight: 800, color: 'white', display: 'flex' }}>{volume} ETH</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <div style={{ fontSize: 24, fontWeight: 900, color: '#10b981', display: 'flex' }}>{yesPct}% YES</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <div style={{ fontSize: 24, fontWeight: 900, color: '#f43f5e', display: 'flex' }}>{noPct}% NO</div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ display: 'flex', width: '100%', height: 12, backgroundColor: '#1e293b', borderRadius: 6 }}>
                            <div style={{ width: `${yesWidth}%`, height: 12, backgroundColor: '#10b981', borderRadius: '6px 0 0 6px' }} />
                            <div style={{ width: `${noWidth}%`, height: 12, backgroundColor: '#f43f5e', borderRadius: '0 6px 6px 0' }} />
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 24, position: 'relative' }}>
                        <div style={{ width: 8, height: 8, backgroundColor: '#3b82f6', borderRadius: 4, marginRight: 12 }} />
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', display: 'flex' }}>PREDICTIVE ECONOMY ON BASE</div>
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
        return Response.redirect(`${baseUrl}/og.png`, 302);
    }
}
