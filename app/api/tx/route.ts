import { NextRequest, NextResponse } from 'next/server';
import { encodeFunctionData, parseEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import { PREDICTION_MARKET_ABI, PREDICTION_MARKET_ADDRESS } from '../../constants';


export async function POST(req: NextRequest): Promise<NextResponse> {
    const url = new URL(req.url);
    const outcome = url.searchParams.get('outcome') === 'true';
    const marketIdRaw = url.searchParams.get('marketId');
    const amountRaw = url.searchParams.get('amount') || '0.001';

    const marketId = marketIdRaw ? BigInt(marketIdRaw) : 1n;
    const betAmount = parseEther(amountRaw);

    const data = encodeFunctionData({
        abi: PREDICTION_MARKET_ABI,
        functionName: 'bet',
        args: [marketId, outcome],
    });

    const txData = {
        chainId: `eip155:${baseSepolia.id}`,
        method: 'eth_sendTransaction',
        params: {
            abi: PREDICTION_MARKET_ABI.filter((item) => item.type === 'function' && item.name === 'bet'),
            to: (process.env.PREDICTION_MARKET_ADDRESS || process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS || PREDICTION_MARKET_ADDRESS) as `0x${string}`,
            data: data,
            value: betAmount.toString(),
        },
    };

    console.log("Generating tx data:", JSON.stringify(txData, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
        , 2));

    return NextResponse.json(txData, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
