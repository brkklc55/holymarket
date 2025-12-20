import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bscTestnet } from 'viem/chains';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const artifact = JSON.parse(fs.readFileSync('prediction-market-artifact-v4.json', 'utf8'));
const { abi } = artifact;

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const account = privateKeyToAccount(PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`);

const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http("https://bsc-testnet-rpc.publicnode.com"),
});

const walletClient = createWalletClient({
    account,
    chain: bscTestnet,
    transport: http("https://bsc-testnet-rpc.publicnode.com"),
});

const PREDICTION_MARKET_ADDRESS = "0x4a60b3a4f33d3ce17fa8392a7b59300f89ad1cce";

async function main() {
    console.log('Creating a test market on v4...');

    const hash = await walletClient.writeContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi,
        functionName: 'createMarket',
        args: ['Bitcoin 2026 başında 100k olur mu?', BigInt(30 * 24 * 60 * 60)], // 30 days
        account,
    });

    console.log('Transaction hash:', hash);
    await publicClient.waitForTransactionReceipt({ hash });
    console.log('Market created successfully!');
}

main().catch(console.error);
