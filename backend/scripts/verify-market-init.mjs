import path from 'path';
import { fileURLToPath } from 'url';
import { createPublicClient, http } from 'viem';
import { bscTestnet } from 'viem/chains';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log("🔍 Verifying Market 0 on BSC Testnet...");

    const publicClient = createPublicClient({
        chain: bscTestnet,
        transport: http("https://data-seed-prebsc-1-s1.binance.org:8545")
    });

    const constantsPath = path.resolve(__dirname, "../../app/constants.ts");
    const constantsContent = fs.readFileSync(constantsPath, "utf8");
    const addressMatch = constantsContent.match(/PREDICTION_MARKET_ADDRESS = "(0x[a-fA-F0-9]{40})"/);
    const contractAddress = addressMatch[1];

    // Minimal ABI to check marketCount
    const abi = [
        {
            "inputs": [],
            "name": "marketCount",
            "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
            "name": "markets",
            "outputs": [
                { "internalType": "string", "name": "question", "type": "string" },
                { "internalType": "uint256", "name": "endTime", "type": "uint256" },
                { "internalType": "uint256", "name": "yesPool", "type": "uint256" }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    try {
        const count = await publicClient.readContract({
            address: contractAddress,
            abi: abi,
            functionName: "marketCount"
        });
        console.log("Market Count:", count.toString());

        if (count > 0n) {
            const market0 = await publicClient.readContract({
                address: contractAddress,
                abi: abi,
                functionName: "markets",
                args: [0n]
            });
            console.log("Market 0 Question:", market0[0]);
            console.log("✅ Market verified successfully!");
        } else {
            console.log("⚠️ Market Count is 0. Initialization failed.");
        }

    } catch (e) {
        console.error("❌ Verification failed:", e.message);
    }
}

main();
