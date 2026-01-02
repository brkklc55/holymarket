import { NextRequest, NextResponse } from 'next/server';

import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_ADDRESS } from '../../constants';

const rpcUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || process.env.BASE_SEPOLIA_RPC_URL || baseSepolia.rpcUrls.default.http[0];

const client = createPublicClient({
    chain: baseSepolia,
    transport: http(rpcUrl),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
    // Fetch market data (assuming market ID 1)
    const marketId = 1n;
    let marketData;
    const address = (process.env.PREDICTION_MARKET_ADDRESS || process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS || PREDICTION_MARKET_ADDRESS) as `0x${string}`;
    let chainId: number | undefined;
    let bytecode: `0x${string}` | null | undefined;
    try {
        chainId = await client.getChainId();
        bytecode = await client.getBytecode({ address });
        if (!bytecode || bytecode === '0x') {
            return NextResponse.json({
                error: 'Contract not found at address on current RPC',
                address,
                rpcUrl,
                chainId,
            }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({
            error: 'RPC/chain check failed',
            address,
            rpcUrl,
            chainId,
            details: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
    try {
        marketData = await client.readContract({
            address,
            abi: PREDICTION_MARKET_ABI,
            functionName: 'markets',
            args: [marketId],
        });
    } catch (error) {
        console.error("Error fetching market:", error);
        return NextResponse.json({
            error: 'Error fetching market data',
            address,
            rpcUrl,
            chainId,
            bytecodeLength: typeof bytecode === 'string' ? bytecode.length : null,
            details: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }

    const [question, endTime, yesPool, noPool, resolved, outcome] = marketData;

    // Calculate odds (simplified)
    const totalPool = yesPool + noPool;
    const yesShare = totalPool > 0n ? (Number(yesPool) / Number(totalPool)) * 100 : 50;
    const noShare = totalPool > 0n ? (Number(noPool) / Number(totalPool)) * 100 : 50;

    const baseUrl = process.env.NEXT_PUBLIC_URL || req.nextUrl.origin || 'http://localhost:3000';

    return new NextResponse(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta property="fc:frame" content="vNext" />
                <meta property="fc:frame:image" content="${baseUrl}/icon.png" />
                <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
                <meta property="fc:frame:post_url" content="${baseUrl}/api/frame" />
                <meta property="fc:frame:button:1" content="Yes (${yesShare.toFixed(1)}%)" />
                <meta property="fc:frame:button:1:action" content="tx" />
                <meta property="fc:frame:button:1:target" content="${baseUrl}/api/tx?outcome=true" />
                <meta property="fc:frame:button:2" content="No (${noShare.toFixed(1)}%)" />
                <meta property="fc:frame:button:2:action" content="tx" />
                <meta property="fc:frame:button:2:target" content="${baseUrl}/api/tx?outcome=false" />
            </head>
            <body style="font-family: sans-serif; padding: 20px;">
                <h1>HolyMarket Frame Endpoint</h1>
                <p>This is a Farcaster Frame (v1).</p>
                <p>To test this frame, please use the <a href="https://warpcast.com/~/developers/frames">Frame Validator</a>.</p>
                <p>Debug Info:</p>
                <ul>
                    <li>Question: ${question}</li>
                    <li>Yes: ${yesShare.toFixed(1)}%</li>
                    <li>No: ${noShare.toFixed(1)}%</li>
                </ul>
            </body>
        </html>
    `, {
        headers: {
            'Content-Type': 'text/html',
        },
    });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    return GET(req);
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
