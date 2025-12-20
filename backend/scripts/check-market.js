const { createPublicClient, http, getContract, defineChain } = require("viem");
const { baseSepolia } = require("viem/chains");

async function main() {
    // Hardcoded address from app/constants.ts for verification
    const address = "0xea75cd541fe7d5fc0c4d2b8d4311a241bd7bfec1";
    console.log("Checking market on contract:", address);

    // Minimal ABI to check market and bet
    const abi = [
        {
            inputs: [
                { name: "_marketId", type: "uint256" },
                { name: "_outcome", type: "bool" }
            ],
            name: "bet",
            outputs: [],
            stateMutability: "payable",
            type: "function"
        },
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
        },
        {
            inputs: [],
            name: "marketCount",
            outputs: [{ name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function"
        }
    ];

    const client = createPublicClient({
        chain: baseSepolia,
        transport: http()
    });

    try {
        const contract = getContract({
            address: address,
            abi: abi,
            client: client
        });

        const count = await contract.read.marketCount();
        console.log("Total Markets:", count.toString());

        const marketId = 1n; // Use BigInt for viem
        if (count < marketId) {
            console.log(`Market ${marketId} does not exist (count=${count})`);
            return;
        }

        const market = await contract.read.markets([marketId]);

        console.log(`Market ${marketId}:`);
        console.log("  Question:", market[0]);
        console.log("  EndTime:", market[1].toString());
        console.log("  Resolved:", market[4]);
    });
    console.log("Simulation SUCCESS: Bet transaction is valid.");
} catch (simError) {
    console.log("Simulation FAILED as expected (likely insufficient funds or logic):");
    // Check if error is logic-related
    if (simError.message.includes("insufficient funds")) {
        console.log("  -> Failed due to insufficient funds (Expected for random account). Contract logic likely OK.");
    } else if (simError.message.includes("Market closed")) {
        console.error("  -> CRITICAL: Contract reverted with 'Market closed'!");
    } else {
        console.error("  -> Unknown error:", simError.message.split('\n')[0]);
    }
}
    } catch (error) {
    console.error("Error fetching market:", error);
}
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
