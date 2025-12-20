import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bscTestnet } from 'viem/chains';
import fs from 'fs';
import 'dotenv/config';

const artifact = JSON.parse(fs.readFileSync('prediction-market-artifact-v6.json', 'utf8'));
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

const PREDICTION_MARKET_ADDRESS = "0x9a76506493a84940989fAec4c82D7b26c71fB744";

async function main() {
    console.log('Creating a test market on v6 (Tax Test)...');

    const hash = await walletClient.writeContract({
        address: PREDICTION_MARKET_ADDRESS,
        abi,
        functionName: 'createMarket',
        args: ['HolyMarket %5 Vergi Sistemi Aktif mi?', BigInt(60 * 60 * 24 * 7)], // 7 days
        account,
    });

    console.log('Transaction hash:', hash);
    await publicClient.waitForTransactionReceipt({ hash });
    console.log('Tax Test Market created successfully!');
}

main().catch(console.error);
