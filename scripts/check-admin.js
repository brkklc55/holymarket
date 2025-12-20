import { createPublicClient, http } from 'viem';
import { bscTestnet } from 'viem/chains';
import { PREDICTION_MARKET_ADDRESS, PREDICTION_MARKET_ABI } from './app/constants.js';

const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http("https://bsc-testnet-rpc.publicnode.com"),
});

async function main() {
    const adminAddress = await publicClient.readContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'admin',
    });
    console.log('Current Admin Address (Tax destination):', adminAddress);
}

main().catch(console.error);
