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
    const premiumImageUrl = `${baseUrl}/og_sade_v11.png`;

    try {
        // Mode 1: Pure static if no question
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

        // Mode 2: Minimalist dynamic info over the premium background
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
                    {/* Bottom Gradient for readability without obscuring the main logo */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(to bottom, rgba(2,6,23,0) 20%, rgba(2,6,23,0.9) 100%)', display: 'flex' }} />

                    {/* Content pushed to bottom */}
                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', position: 'relative' }}>
                        <div style={{ fontSize: 38, fontWeight: 900, color: 'white', lineHeight: 1.2, marginBottom: 20, textShadow: '0 2px 8px rgba(0,0,0,0.8)', display: 'flex' }}>
                            {question}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', marginBottom: 2, display: 'flex', letterSpacing: '0.1em' }}>VOLUME</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: 'white', display: 'flex' }}>{volume} ETH</div>
                                </div>
                                <div style={{ display: 'flex', gap: 15 }}>
                                    <div style={{ fontSize: 18, fontWeight: 900, color: '#10b981', display: 'flex' }}>{yesPct}% YES</div>
                                    <div style={{ fontSize: 18, fontWeight: 900, color: '#f43f5e', display: 'flex' }}>{noPct}% NO</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', width: '100%', height: 6, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 3 }}>
                                <div style={{ width: `${yesWidth}%`, height: 6, backgroundColor: '#10b981', borderRadius: '3px 0 0 3px' }} />
                                <div style={{ width: `${noWidth}%`, height: 6, backgroundColor: '#f43f5e', borderRadius: '0 3px 3px 0' }} />
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
