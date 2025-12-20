import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bscTestnet } from 'viem/chains';
import fs from 'fs';
import 'dotenv/config';

const artifact = JSON.parse(fs.readFileSync('prediction-market-artifact-v5.json', 'utf8'));
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

// Get address from constants.ts indirectly or just hardcode from recent deploy
const PREDICTION_MARKET_ADDRESS = "0x56a6328670A8877180D82f5b4cb6ead7352bf2f2";

async function main() {
    console.log('Creating a test market on v5...');

    const hash = await walletClient.writeContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi,
        functionName: 'createMarket',
        args: ['Binance 2026 başında en büyük borsa kalmaya devam eder mi?', BigInt(60 * 60 * 24 * 30)], // 30 days
        account,
    });

    console.log('Transaction hash:', hash);
    await publicClient.waitForTransactionReceipt({ hash });
    console.log('Market created successfully!');
}

main().catch(console.error);
