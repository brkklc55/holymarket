import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createPublicClient, http } from 'viem';
import { bscTestnet } from 'viem/chains';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.resolve(__dirname, "../.env");
console.log("Loading .env from:", envPath);
dotenv.config({ path: envPath });

async function main() {
    console.log("Checking Environment...");
    const pk = process.env.PRIVATE_KEY;
    if (!pk) {
        console.error("❌ PRIVATE_KEY is missing!");
        return;
    }
    console.log("✅ PRIVATE_KEY found (length: " + pk.length + ")");

    console.log("Checking Network Connection...");
    const client = createPublicClient({
        chain: bscTestnet,
        transport: http("https://data-seed-prebsc-1-s1.binance.org:8545")
    });

    try {
        const blockNumber = await client.getBlockNumber();
        console.log("✅ Connected! Current Block:", blockNumber.toString());
    } catch (e) {
        console.error("❌ Connection failed:", e.message);
    }
}

main();
