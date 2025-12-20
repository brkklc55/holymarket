import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bscTestnet } from 'viem/chains';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const artifact = JSON.parse(fs.readFileSync('prediction-market-artifact-v5.json', 'utf8'));
const { abi, bytecode } = artifact;

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
    console.error('PRIVATE_KEY not found in .env');
    process.exit(1);
}

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

async function main() {
    console.log('Deploying PredictionMarket v5...');

    const hash = await walletClient.deployContract({
        abi,
        account,
        bytecode: `0x${bytecode.replace(/^0x/, '')}`,
    });

    console.log('Transaction hash:', hash);
    console.log('Waiting for deployment...');

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    console.log('Contract deployed at:', receipt.contractAddress);

    // Update constants.ts
    const constantsPath = path.resolve('app', 'constants.ts');
    const abiString = JSON.stringify(abi, null, 2);
    const newConstants = `export const PREDICTION_MARKET_ADDRESS = "${receipt.contractAddress}";\n\nexport const PREDICTION_MARKET_ABI = ${abiString} as const;\n`;

    fs.writeFileSync(constantsPath, newConstants);
    console.log('app/constants.ts updated!');
}

main().catch(console.error);
