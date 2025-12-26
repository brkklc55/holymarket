import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';


export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    const appOrigin = "https://baseappholymarket.xyz";

    try {
        console.log("Starting OG Image Generation");

        // __ICON_PLACEHOLDER__
        const iconDataUri = ""; // Will be replaced by script

        // 2. Font Loading (Disabled for now to prevent 404 crashes)
        // const fontData = await fetch(new URL('https://baseappholymarket.xyz/fonts/Inter-Bold.ttf')).then((res) => res.arrayBuffer());

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
                        backgroundColor: '#020617', // Slate 950
                        fontFamily: 'sans-serif', // Fallback to system font
                    }}
                >
                    {/* Branding - Logo */}
                    <img
                        src={iconDataUri}
                        alt="HolyMarket Logo"
                        width="120"
                        height="120"
                        style={{ marginBottom: 40 }}
                    />

                    {/* Branding - Text */}
                    <div
                        style={{
                            display: 'flex',
                            fontSize: 60,
                            fontStyle: 'normal',
                            letterSpacing: '-0.025em',
                            color: 'white',
                            lineHeight: 1.4,
                            whiteSpace: 'pre-wrap',
                            textAlign: 'center',
                            fontWeight: 700,
                        }}
                    >
                        HOLYMARKET
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
                // fonts: [
                //     {
                //         name: 'Inter',
                //         data: fontData,
                //         style: 'normal',
                //         weight: 700,
                //     },
                // ],
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            },
        );
    } catch (e: any) {
        console.error('OG Image Generation Error:', e);
        return new Response(`Failed to generate the image: ${e.message} \nStack: ${e.stack}`, {
            status: 500,
        });
    }
}
