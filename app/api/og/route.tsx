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

    const baseUrl = 'https://www.baseappholymarket.xyz';
    const premiumImageUrl = `${baseUrl}/og_premium.png`;

    try {
        // If it's static (shared home link), return ONLY the premium background image
        if (!question) {
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

        // Mode 2: Dynamic Question Card (Minimalist overlay on Premium Background)
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
                    {/* Minimal Overlay: Light gradient at the bottom only for readability */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(to bottom, rgba(2,6,23,0) 0%, rgba(2,6,23,0.8) 100%)', display: 'flex' }} />

                    {/* Dynamic Question Content - Positioned to not overlap main logo */}
                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', position: 'relative' }}>
                        {/* Question Badge/Text */}
                        <div style={{ fontSize: 40, fontWeight: 900, color: 'white', lineHeight: 1.2, marginBottom: 24, textShadow: '0 2px 10px rgba(0,0,0,0.5)', display: 'flex' }}>
                            {question}
                        </div>

                        {/* Choice Badge - only if choice exists */}
                        {choice ? (
                            <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', marginBottom: 24, backgroundColor: 'rgba(30, 41, 59, 1)', padding: '10px 20px', borderRadius: 12, border: `2px solid ${choiceColor}` }}>
                                <div style={{ fontSize: 14, fontWeight: 900, color: choiceColor, marginRight: 10, display: 'flex', letterSpacing: '0.05em' }}>PREDICTION:</div>
                                <div style={{ fontSize: 28, fontWeight: 900, color: 'white', display: 'flex' }}>{choice.toUpperCase()}</div>
                            </div>
                        ) : null}

                        {/* Stats & Progress */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 4, display: 'flex', letterSpacing: '0.1em' }}>VOLUME</div>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: 'white', display: 'flex' }}>{volume} ETH</div>
                                </div>
                                <div style={{ display: 'flex', gap: 20 }}>
                                    <div style={{ fontSize: 20, fontWeight: 900, color: '#10b981', display: 'flex' }}>{yesPct}% YES</div>
                                    <div style={{ fontSize: 20, fontWeight: 900, color: '#f43f5e', display: 'flex' }}>{noPct}% NO</div>
                                </div>
                            </div>
                            {/* Progress Bar */}
                            <div style={{ display: 'flex', width: '100%', height: 8, backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 4 }}>
                                <div style={{ width: `${yesWidth}%`, height: 8, backgroundColor: '#10b981', borderRadius: '4px 0 0 4px' }} />
                                <div style={{ width: `${noWidth}%`, height: 8, backgroundColor: '#f43f5e', borderRadius: '0 4px 4px 0' }} />
                            </div>
                        </div>
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
