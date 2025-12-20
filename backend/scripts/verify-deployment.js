require('dotenv').config();
const { createPublicClient, http, parseAbiItem } = require('viem');
const { baseSepolia } = require('viem/chains');

// Address from app/constants.ts
const CONTRACT_ADDRESS = "0xea75cd541fe7d5fc0c4d2b8d4311a241bd7bfec1";

const ABI = [
    {
        "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "name": "markets",
        "outputs": [
            { "internalType": "string", "name": "question", "type": "string" },
            { "internalType": "uint256", "name": "endTime", "type": "uint256" },
            { "internalType": "uint256", "name": "yesPool", "type": "uint256" },
            { "internalType": "uint256", "name": "noPool", "type": "uint256" },
            { "internalType": "bool", "name": "resolved", "type": "bool" },
            { "internalType": "bool", "name": "outcome", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

async function main() {
    const client = createPublicClient({
        chain: baseSepolia,
        transport: http()
    });

    console.log(`Checking contract at ${CONTRACT_ADDRESS}...`);
    const code = await client.getBytecode({ address: CONTRACT_ADDRESS });

    if (!code || code === '0x') {
        console.error("❌ NO CONTRACT FOUND at this address!");
        return;
    }
    console.log("✅ Contract code found.");

    console.log("Checking Market 0...");
    try {
        const market = await client.readContract({
            address: CONTRACT_ADDRESS,
            abi: ABI,
            functionName: 'markets',
            args: [0n]
        });

        console.log("Market 0 Question:", market[0]);
        console.log("Market 0 End Time:", market[1].toString());
        console.log("Current Time:", Math.floor(Date.now() / 1000));

        if (Number(market[1]) > Math.floor(Date.now() / 1000)) {
            console.log("✅ Market is OPEN.");
        } else {
            console.log("❌ Market is CLOSED (Time expired).");
        }

    } catch (error) {
        console.error("❌ Error fetching market 0:", error);
    }
}

main();
