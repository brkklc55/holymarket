import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWalletClient, http, createPublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bscTestnet } from 'viem/chains';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
    console.log("🚀 Initializing Market 0 on BSC Testnet...");

    let PK = process.env.PRIVATE_KEY;
    if (!PK) throw new Error("Missing PRIVATE_KEY");
    if (!PK.startsWith("0x")) PK = "0x" + PK;

    const account = privateKeyToAccount(PK);

    const client = createWalletClient({
        account,
        chain: bscTestnet,
        transport: http("https://data-seed-prebsc-1-s1.binance.org:8545")
    });

    const publicClient = createPublicClient({
        chain: bscTestnet,
        transport: http("https://data-seed-prebsc-1-s1.binance.org:8545")
    });

    // Get ABI and Address (from constants.ts or artifact)
    // Simpler to read artifact for ABI and constants for address, but let's use artifact + regex for address/constants logic or just hardcode if I knew it.
    // I know the address is in constants.ts. I'll verify it from there or just use the artifact.
    // Actually, I can read constants.ts to find the address.

    const constantsPath = path.resolve(__dirname, "../../app/constants.ts");
    const constantsContent = fs.readFileSync(constantsPath, "utf8");
    const addressMatch = constantsContent.match(/PREDICTION_MARKET_ADDRESS = "(0x[a-fA-F0-9]{40})"/);

    if (!addressMatch) {
        throw new Error("Could not find address in constants.ts");
    }
    const contractAddress = addressMatch[1];
    console.log("Contract Address:", contractAddress);

    const artifactPath = path.resolve(__dirname, "../../simple-prediction-market-artifact.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const hash = await client.writeContract({
        address: contractAddress,
        abi: artifact.abi,
        functionName: 'createMarket',
        args: ["Will BTC hit $100k in 2024?", 86400 * 7], // 7 days duration
        chain: bscTestnet,
        account
    });

    console.log("Creation Tx:", hash);
    await publicClient.waitForTransactionReceipt({ hash });
    console.log("✅ Market 0 Created!");
}

main().catch(console.error);
