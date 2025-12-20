const { createPublicClient, http, getContract, defineChain } = require("viem");
const { baseSepolia } = require("viem/chains");

async function main() {
    const address = "0xea75cd541fe7d5fc0c4d2b8d4311a241bd7bfec1";

    // Minimal ABI
    const abi = [
        {
            inputs: [{ name: "", type: "uint256" }],
            name: "markets",
            outputs: [
                { name: "question", type: "string" },
                { name: "endTime", type: "uint256" },
                { name: "yesPool", type: "uint256" },
                { name: "noPool", type: "uint256" },
                { name: "resolved", type: "bool" },
                { name: "outcome", type: "bool" }
            ],
            stateMutability: "view",
            type: "function"
        }
    ];

    const client = createPublicClient({
        chain: baseSepolia,
        transport: http()
    });

    const contract = getContract({ address, abi, client });

    const marketId = 3n;
    console.log(`Checking Market ${marketId}...`);

    try {
        const market = await contract.read.markets([marketId]);
        const endTime = Number(market[1]);

        // Get current block timestamp
        const block = await client.getBlock();
        const currentTime = Number(block.timestamp);

        console.log(`Question: ${market[0]}`);
        console.log(`End Time:   ${new Date(endTime * 1000).toLocaleString()} (${endTime})`);
        console.log(`Current:    ${new Date(currentTime * 1000).toLocaleString()} (${currentTime})`);

        const diff = endTime - currentTime;
        if (diff > 0) {
            console.log(`\nMARKET IS OPEN. Closes in ${Math.floor(diff / 60)} minutes.`);
        } else {
            console.log(`\nMARKET ENDED. Can be resolved.`);
        }
    } catch (e) {
        console.log("Market not found or error:", e.message);
    }
}

main().catch(console.error);
